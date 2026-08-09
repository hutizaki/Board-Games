import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './TeamsScreen.css';
import { normalizeName, sameName, MAX_NAME_LENGTH, type Player } from './tabooRoster';

interface TeamsScreenProps {
  players: Player[];
  setPlayers: (next: Player[]) => void;
  recents: string[];
  setRecents: (next: string[]) => void;
  teamNames: [string, string];
  setTeamNames: (next: [string, string]) => void;
  /** Rounds each team will play, derived from the larger line-up. */
  roundsPerTeam: number;
  onPlay: () => void;
  onBack: () => void;
  onSound: (kind: 'select' | 'back' | 'forward') => void;
}

interface Removal {
  player: Player;
  index: number;
  wasNewRecent: boolean;
}

const UNDO_MS = 6000;

/** Ids are never reused: FLIP keys on them, and a reused id animates a new
 *  pill from a stranger's old position. */
let nextPlayerId = 1;

function TeamsScreen({
  players,
  setPlayers,
  recents,
  setRecents,
  teamNames,
  setTeamNames,
  roundsPerTeam,
  onPlay,
  onBack,
  onSound,
}: TeamsScreenProps) {
  const [draft, setDraft] = useState('');
  const [removal, setRemoval] = useState<Removal | null>(null);
  // Turns the saved chips into "forget this name" buttons, so a typo doesn't
  // live in the pool forever.
  const [managing, setManaging] = useState(false);

  const squadsRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set by an action to ask the layout effect for a FLIP pass
  const beforeRects = useRef<Map<number, DOMRect> | null>(null);
  const keepFocusOn = useRef<number | null>(null);

  // Typing filters the saved pool by prefix: "m" narrows it to the Ms. Tapping
  // a chip doesn't touch the box, so a whole run of Ms can be tapped in a row.
  const prefix = draft.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const matches = prefix
    ? recents.filter((n) => n.toLowerCase().startsWith(prefix))
    : recents;

  const onTeam = (team: 0 | 1) => players.filter((p) => p.team === team);
  const countA = onTeam(0).length;
  const countB = onTeam(1).length;
  const total = players.length;

  // ---- Motion -------------------------------------------------------------
  // FLIP rather than a CSS transition: a pill is destroyed and recreated in the
  // other column, so there is no continuous element for CSS to animate. Capture
  // positions here; the layout effect below plays the difference.

  const withMotion = useCallback((mutate: () => void) => {
    const root = squadsRef.current;
    if (root) {
      const rects = new Map<number, DOMRect>();
      root.querySelectorAll<HTMLElement>('.player').forEach((el) => {
        rects.set(Number(el.dataset.id), el.getBoundingClientRect());
      });
      beforeRects.current = rects;
    }
    const focusedRow = (document.activeElement as HTMLElement | null)?.closest?.(
      '.player'
    ) as HTMLElement | null;
    keepFocusOn.current = focusedRow ? Number(focusedRow.dataset.id) : null;
    mutate();
  }, []);

  useLayoutEffect(() => {
    const before = beforeRects.current;
    if (!before) return;
    beforeRects.current = null;

    const root = squadsRef.current;
    if (!root) return;

    // Keyboard focus must survive the re-render
    const keep = keepFocusOn.current;
    keepFocusOn.current = null;
    if (keep !== null) {
      root.querySelector<HTMLElement>(`.player[data-id="${keep}"] .who`)?.focus();
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.querySelectorAll<HTMLElement>('.player').forEach((el) => {
      const from = before.get(Number(el.dataset.id));
      if (!from) {
        // Added or restored by Undo: no previous position, so scale it in
        el.animate(
          [
            { opacity: 0, transform: 'scale(0.82)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 200, easing: 'cubic-bezier(.2,.9,.3,1.2)' }
        );
        return;
      }
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (!dx && !dy) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    });
  });

  // ---- Undo ---------------------------------------------------------------

  const hideUndo = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = null;
    setRemoval(null);
  }, []);

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  // ---- Actions ------------------------------------------------------------

  const addPlayer = (raw: string) => {
    const name = normalizeName(raw);
    if (!name) return;
    hideUndo();
    onSound('select');
    withMotion(() => {
      // Ties go to team 0
      const team: 0 | 1 = countA <= countB ? 0 : 1;
      setPlayers([...players, { id: nextPlayerId++, name, team }]);
      setRecents(recents.filter((r) => !sameName(r, name)));
    });
  };

  /** `to` omitted toggles; the arrow keys pass an absolute destination. */
  const hop = (id: number, to?: 0 | 1) => {
    onSound('select');
    withMotion(() => {
      setPlayers(
        players.map((p) =>
          p.id === id ? { ...p, team: to ?? (p.team === 0 ? 1 : 0) } : p
        )
      );
    });
  };

  const drop = (id: number) => {
    const index = players.findIndex((p) => p.id === id);
    if (index < 0) return;
    const player = players[index];
    const wasNewRecent = !recents.some((r) => sameName(r, player.name));
    onSound('back');
    withMotion(() => {
      if (wasNewRecent) setRecents([player.name, ...recents]);
      setPlayers(players.filter((p) => p.id !== id));
    });
    navigator.vibrate?.(15);

    if (undoTimer.current) clearTimeout(undoTimer.current);
    setRemoval({ player, index, wasNewRecent });
    undoTimer.current = setTimeout(() => setRemoval(null), UNDO_MS);
  };

  const undo = () => {
    if (!removal) return;
    const { player, index, wasNewRecent } = removal;
    hideUndo();
    onSound('forward');
    withMotion(() => {
      const next = [...players];
      next.splice(Math.min(index, next.length), 0, player);
      setPlayers(next);
      if (wasNewRecent) setRecents(recents.filter((r) => !sameName(r, player.name)));
    });
  };

  const shuffle = () => {
    onSound('select');
    withMotion(() => {
      const order = [...players];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      const teamById = new Map(order.map((p, i) => [p.id, (i % 2) as 0 | 1]));
      setPlayers(players.map((p) => ({ ...p, team: teamById.get(p.id) ?? p.team })));
    });
  };

  /**
   * Adds the typed name and hands focus straight back to the box. The host is
   * usually entering a whole family in one go, so the keyboard has to stay up
   * between names — it only drops when they tap away themselves. Refocusing
   * synchronously keeps it inside the original gesture, which is what mobile
   * browsers require before they will re-open the keyboard.
   */
  const commitDraft = () => {
    addPlayer(draft);
    setDraft('');
    nameRef.current?.focus();
  };

  const renameTeam = (team: 0 | 1, value: string) => {
    const next: [string, string] = [...teamNames];
    next[team] = value;
    setTeamNames(next);
  };

  // ---- Status -------------------------------------------------------------
  // Never blocks silently: the line always says why Let's Play is off.

  const gap = Math.abs(countA - countB);
  const emptyTeam = total >= 4 && (countA === 0 || countB === 0);
  const canPlay = total >= 4 && countA > 0 && countB > 0;

  let status: React.ReactNode;
  if (total < 4) {
    status = (
      <>
        Taboo needs <b>4 players</b> — add {4 - total} more.
      </>
    );
  } else if (emptyTeam) {
    status = (
      <span className="warn">
        {countA === 0 ? teamNames[0] : teamNames[1]} has nobody — move someone across.
      </span>
    );
  } else if (gap > 1) {
    status = (
      <>
        <span className="warn">
          {countA > countB ? teamNames[0] : teamNames[1]} has {gap} extra.
        </span>{' '}
        Move someone across to even it up.
      </>
    );
  } else {
    status = (
      <>
        <b>
          {roundsPerTeam} round{roundsPerTeam === 1 ? '' : 's'} each
        </b>{' '}
        · everyone gives clues at least once
      </>
    );
  }

  // ---- Render -------------------------------------------------------------

  const renderSquad = (team: 0 | 1) => {
    const list = onTeam(team);
    const arrow = team === 0 ? '›' : '‹';
    const otherName = teamNames[team === 0 ? 1 : 0];
    return (
      <section className="squad" data-team={team === 0 ? 'A' : 'B'}>
        <div className="squad-head">
          <input
            className="squad-name"
            value={teamNames[team]}
            maxLength={14}
            aria-label={`Name of ${teamNames[team]}`}
            onChange={(e) => renameTeam(team, e.target.value)}
            onBlur={(e) => {
              if (!e.target.value.trim()) renameTeam(team, team === 0 ? 'Team A' : 'Team B');
            }}
          />
          <span className="squad-tally" aria-label={`${list.length} players`}>
            {list.length}
          </span>
        </div>
        <div className="roster">
          {list.map((p) => (
            <div className="player" key={p.id} data-id={p.id}>
              <button
                className="kill"
                tabIndex={-1}
                aria-label={`Take ${p.name} out of the game`}
                onClick={() => drop(p.id)}
              >
                ×
              </button>
              <button
                className="who"
                aria-label={`${p.name} — move to ${otherName}`}
                onClick={() => hop(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    hop(p.id, 1);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    hop(p.id, 0);
                  } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    drop(p.id);
                  }
                }}
              >
                <span className="nm">{p.name}</span>
                <span className="ar" aria-hidden="true">
                  {arrow}
                </span>
              </button>
            </div>
          ))}
          {list.length === 0 && (
            <p className="empty">
              No one here yet.
              <br />
              Tap a name to move it over.
            </p>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="taboo-teams">
      <header className="masthead">
        <h1>Teams</h1>
        <span className="tally-all">{total ? `${total} playing` : ''}</span>
      </header>

      <div className="entry">
        <input
          ref={nameRef}
          value={draft}
          placeholder="Add a player…"
          autoComplete="off"
          autoCapitalize="words"
          /* "next" keeps the IME open for another name; "done" tells Android to
             close it, which is exactly what we don't want here. */
          enterKeyHint="next"
          maxLength={MAX_NAME_LENGTH}
          aria-label="Player name"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitDraft();
              return;
            }
            // Token-field habit: backspace on an empty box takes back the last add
            if (e.key === 'Backspace' && !draft && players.length) {
              e.preventDefault();
              drop(players[players.length - 1].id);
            }
          }}
        />
        <button
          className="add"
          aria-label="Add player"
          disabled={!draft.trim()}
          /* Stops the button taking focus, so the box is never blurred and the
             keyboard never flickers shut between names. */
          onMouseDown={(e) => e.preventDefault()}
          onClick={commitDraft}
        >
          +
        </button>
      </div>

      {/* Saved names: the pool survives between game nights, so a reunion never
          retypes the same family twice. Tap to bring someone back in. */}
      <div className="pool">
        {recents.length > 0 && (
          <div className="pool-head">
            <span className="pool-label">
              {prefix ? `Saved · starting with “${prefix}”` : 'Saved players'}
            </span>
            <button
              className="pool-edit"
              onClick={() => {
                onSound('select');
                setManaging((v) => !v);
              }}
            >
              {managing ? 'Done' : 'Edit'}
            </button>
          </div>
        )}
        <div className="recents">
          {matches.map((name) => (
            <button
              key={name}
              className={`recent${managing ? ' is-managing' : ''}`}
              aria-label={managing ? `Forget ${name}` : `Add ${name} to the game`}
              onClick={() => {
                if (managing) {
                  onSound('back');
                  setRecents(recents.filter((r) => !sameName(r, name)));
                } else {
                  addPlayer(name);
                }
              }}
            >
              {name}
            </button>
          ))}
          {recents.length > 0 && matches.length === 0 && (
            <span className="pool-none">No saved name starts with “{prefix}”</span>
          )}
        </div>
      </div>

      <div className="squads" ref={squadsRef}>
        {renderSquad(0)}
        {renderSquad(1)}
      </div>

      <div className="controls">
        <div className="undo" data-open={removal ? 'true' : 'false'} role="status">
          <p>
            {removal && (
              <>
                <b>{removal.player.name}</b> is out of the game.
              </>
            )}
          </p>
          <button onClick={undo}>Undo</button>
        </div>

        <p className="status">{status}</p>

        <button className="shuffle" onClick={shuffle}>
          ↻ Shuffle teams
        </button>

        <button
          className="btn btn-play"
          disabled={!canPlay}
          onClick={() => {
            onSound('forward');
            onPlay();
          }}
        >
          Let's Play!
        </button>

        <button
          className="btn btn-back"
          onClick={() => {
            onSound('back');
            onBack();
          }}
        >
          Back
        </button>

        <p className="hint">
          Click a name to move it across, or the <kbd>×</kbd> to take someone out.{' '}
          <kbd>←</kbd> <kbd>→</kbd> move, <kbd>Del</kbd> removes. Backspace in an empty name
          box removes the last one you added.
        </p>
      </div>
    </div>
  );
}

export default TeamsScreen;
