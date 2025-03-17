using System;

namespace MoodTrackerApi.Models
{
    public class MoodEntry
    {
        public long Id { get; set; }
        public DateTime Date { get; set; }
        public string Mood { get; set; }
        public string Exercise { get; set; }
        public double Sleep { get; set; }
        public string Alcohol { get; set; }
        public string Diet { get; set; }
        public string Work { get; set; }
        public string Relationship { get; set; }
        public string Social { get; set; }
        public string Weather { get; set; }
        public string Notes { get; set; }
    }
} 