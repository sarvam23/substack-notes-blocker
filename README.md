# Substack Focus 🎯

**Enhanced productivity extension for Substack with selective blocking, usage statistics, and focus metrics**

Transform your Substack reading experience with intelligent content filtering, detailed analytics, and productivity insights. Take control of distractions and maximize your reading focus.

## ✨ Key Features

### 🎯 **Focus Controls**
- **Block Notes Feed** - Hide the main Notes feed from your dashboard
- **Block All Notifications** - Hide notification bells and badges everywhere

### ⚙️ **Selective Blocking**
Choose exactly what to hide with granular controls:
- **Hide Notes Tab** - Remove Notes tab from navigation
- **Hide Notes in Feed** - Remove Notes from your main content feed
- **Hide Notes Notifications** - Block only Notes-related notifications
- **Hide Notes Sidebar** - Remove Notes widgets from sidebars

### 📊 **Usage Statistics**
Track your productivity improvements:
- **Hidden Items Counter** - See how many distracting elements were blocked today
- **Time Saved** - Estimated time saved by blocking distractions
- **Focus Score** - Dynamic score based on your blocking settings and usage
- **Streak Days** - Track consecutive days of focused reading

### 🚀 **Productivity Metrics**
Advanced analytics for reading optimization:
- **Reading Focus** - Measures your content engagement level
- **Distraction Reduction** - Shows how effectively distractions are minimized
- **Weekly Average** - Trend analysis of your productivity over time
- **Progress Visualization** - Beautiful progress bars and charts

## 🛠️ Installation

### From Chrome Web Store (Recommended)
*Coming Soon - Extension under review*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Substack Focus icon will appear in your toolbar

## 🎮 How to Use

1. **Click the extension icon** when visiting any Substack site
2. **Toggle main controls** for broad blocking (Notes Feed, All Notifications)
3. **Fine-tune with selective blocking** for specific elements
4. **Monitor your statistics** to see productivity improvements
5. **Track metrics** to understand your reading patterns

### Quick Start Tips
- Start with "Block Notes Feed" for immediate distraction reduction
- Use selective blocking to customize your experience
- Check statistics daily to see your progress
- Reset statistics weekly/monthly for fresh tracking

## 📈 Statistics & Metrics Explained

### Daily Statistics
- **Hidden Items**: Number of distracting elements blocked today
- **Time Saved**: Estimated time saved (2-5 seconds per blocked item)
- **Focus Score**: Calculated based on active blocking settings
- **Day Streak**: Consecutive days of using the extension

### Productivity Metrics
- **Reading Focus** (70-98%): Engagement level with meaningful content
- **Distraction Reduction** (85-98%): Effectiveness of blocking settings
- **Weekly Average** (0-100%): 4-week rolling average of productivity

### How Scores Are Calculated
- **Base scores** start at healthy defaults
- **Settings weights**: Different blocking options contribute different amounts
- **Usage bonuses**: Active use increases scores over time
- **Time factors**: Consistent daily use improves long-term metrics

## 🎨 Features in Detail

### Smart Detection
- **Dynamic selectors** that adapt to Substack UI changes
- **Comprehensive coverage** of Notes elements across all page types
- **Performance optimized** with efficient DOM monitoring

### Visual Experience
- **Smooth transitions** when content is hidden/shown
- **Clean layout** with no leftover gaps or broken designs
- **Modern UI** with intuitive controls and beautiful statistics

### Privacy & Data
- **Local storage only** - all data stays on your device
- **No tracking** - extension doesn't collect personal information
- **Minimal permissions** - only accesses Substack sites

## 🔧 Technical Details

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

### Performance
- **Lightweight** - minimal impact on page load times
- **Efficient** - uses modern web APIs for optimal performance
- **Responsive** - works on desktop and mobile Substack views

### Architecture
- **Content Script**: Handles DOM manipulation and element hiding
- **Background Service Worker**: Manages statistics and periodic tasks
- **Popup Interface**: Provides user controls and statistics display
- **Storage System**: Tracks settings and analytics data

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** by opening an issue
2. **Suggest features** with detailed use cases
3. **Submit pull requests** with improvements
4. **Share feedback** about your experience

### Development Setup
```bash
git clone <repository-url>
cd substack-focus
# Load in Chrome as unpacked extension
# Make changes and test on Substack sites
```

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ Added selective blocking controls
- 📊 Implemented comprehensive statistics tracking
- 🚀 Added productivity metrics and analytics
- 🎨 Redesigned popup with modern UI
- ⚡ Enhanced performance and reliability
- 🔧 Improved Substack element detection

### Version 1.0.0
- 🎯 Basic Notes feed blocking
- 🔕 Simple notification hiding
- ⚙️ Basic toggle controls

## 🐛 Known Issues

- Some dynamic content may require page refresh
- Statistics reset at midnight (by design)
- Very new Substack UI changes may need selector updates

## 📞 Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Questions**: Check existing issues or start a discussion
- **Updates**: Watch the repository for new releases

## 📄 License

MIT License - feel free to use, modify, and distribute

## 🙏 Acknowledgments

- Substack team for building an amazing platform
- Chrome Extensions community for documentation and examples
- Users who provide feedback and feature suggestions

---

**Made with ❤️ for focused reading**

*Transform your Substack experience today - because every minute of focused reading counts!*