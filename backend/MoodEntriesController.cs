using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoodTrackerApi.Data;
using MoodTrackerApi.Models;

namespace MoodTrackerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoodEntriesController : ControllerBase
    {
        private readonly MoodTrackerContext _context;

        public MoodEntriesController(MoodTrackerContext context)
        {
            _context = context;
        }

        // GET: api/MoodEntries
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MoodEntry>>> GetMoodEntries()
        {
            return await _context.MoodEntries.ToListAsync();
        }

        // GET: api/MoodEntries/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MoodEntry>> GetMoodEntry(long id)
        {
            var moodEntry = await _context.MoodEntries.FindAsync(id);

            if (moodEntry == null)
            {
                return NotFound();
            }

            return moodEntry;
        }

        // POST: api/MoodEntries
        [HttpPost]
        public async Task<ActionResult<MoodEntry>> PostMoodEntry(MoodEntry moodEntry)
        {
            _context.MoodEntries.Add(moodEntry);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMoodEntry), new { id = moodEntry.Id }, moodEntry);
        }

        // PUT: api/MoodEntries/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMoodEntry(long id, MoodEntry moodEntry)
        {
            if (id != moodEntry.Id)
            {
                return BadRequest();
            }

            _context.Entry(moodEntry).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MoodEntryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/MoodEntries/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMoodEntry(long id)
        {
            var moodEntry = await _context.MoodEntries.FindAsync(id);
            if (moodEntry == null)
            {
                return NotFound();
            }

            _context.MoodEntries.Remove(moodEntry);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MoodEntryExists(long id)
        {
            return _context.MoodEntries.Any(e => e.Id == id);
        }
    }
} 