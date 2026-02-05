using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FineArtApi.Data;
using FineArtApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FineArtApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserSubTypesController : ControllerBase
    {
        private readonly ArtContext _context;

        public UserSubTypesController(ArtContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserSubType>>> GetUserSubTypes()
        {
            return await _context.UserSubTypes.ToListAsync();
        }
    }
}
