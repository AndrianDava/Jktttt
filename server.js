const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://jkt48.com/member/list?lang=id';
const baseUrl = 'https://jkt48.com';

let membersList = [];

// Fungsi untuk melakukan scraping dan memuat data anggota JKT48
const fetchData = async () => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    $('.col-4.col-lg-2').each((index, element) => {
      const name = $(element).find('.entry-member__name a').text().trim().replace('\n', ' ');
      const image = $(element).find('img').attr('src');
      const fullImageUrl = baseUrl + image;
      const link = $(element).find('.entry-member__name a').attr('href');
      const fullLinkUrl = baseUrl + link;

      membersList.push({ name, image: fullImageUrl, link: fullLinkUrl });
    });

    console.log('Data anggota JKT48 telah dimuat.');
  } catch (error) {
    console.error('Error fetching member list:', error.message);
  }
};

// Panggil fungsi fetchData untuk memulai scraping saat server berjalan
fetchData();

// Fungsi untuk mencari anggota berdasarkan nama
function searchMemberByName(query) {
  query = query.trim().toLowerCase();
  return membersList.filter(member =>
    member.name.toLowerCase().includes(query)
  );
}

// Handler untuk Vercel Function
module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Parameter query tidak ditemukan.' });
  }

  try {
    // Tunggu sampai proses scraping selesai sebelum melakukan pencarian
    await fetchData();
    
    const searchResults = searchMemberByName(query);
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching members:', error.message);
    res.status(500).json({ error: 'Terjadi kesalahan saat mencari anggota JKT48.' });
  }
};
