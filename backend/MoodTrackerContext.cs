using Microsoft.EntityFrameworkCore;
using MoodTrackerApi.Models;

namespace MoodTrackerApi.Data
{
    public class MoodTrackerContext : DbContext
    {
        public MoodTrackerContext(DbContextOptions<MoodTrackerContext> options)
            : base(options)
        {
        }

        public DbSet<MoodEntry> MoodEntries { get; set; }
    }
} 