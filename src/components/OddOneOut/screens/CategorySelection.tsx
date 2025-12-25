import { motion } from 'framer-motion';
import { Category } from '../categories';

interface Props {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onBack: () => void;
}

export default function CategorySelection({ categories, onSelectCategory, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen p-6 pb-20"
    >
      <button
        onClick={onBack}
        className="text-white/70 hover:text-white transition-colors mb-8"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h1 className="text-4xl font-bold mb-2">Category Selection</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Create Custom Category Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-3xl p-6 text-left relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-xl font-bold mb-1">Create Custom</h3>
            <p className="text-sm text-white/60">Your categories</p>
          </div>
        </motion.button>

        {/* Category Cards */}
        {categories.map((category) => (
          <motion.button
            key={category.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category)}
            className="bg-[#1A1F3A] hover:bg-[#232947] border border-white/10 rounded-3xl p-6 text-left relative overflow-hidden group transition-colors"
          >
            <div className="relative">
              <h3 className="text-xl font-bold mb-3">{category.name}</h3>
              <div className="flex items-center gap-2 text-sm text-cyan-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{category.wordCount || category.words.length} words</span>
              </div>
              {category.isPro && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  PRO
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

