const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const url = 'https://jkt48.com/member/list?lang=id';
const baseUrl = 'https://jkt48.com';

// Endpoint untuk mengambil data anggota JKT48
app.get('/fetch-members', async (req, res) => {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const membersList = [];

    $('.col-4.col-lg-2').each((index, element) => {
      const name = $(element).find('.entry-member__name a').text().trim().replace('\n', ' ');
      const image = $(element).find('img').attr('src');
      const fullImageUrl = baseUrl + image;
      const link = $(element).find('.entry-member__name a').attr('href');
      const fullLinkUrl = baseUrl + link;

      membersList.push({ name, image: fullImageUrl, link: fullLinkUrl });
    });

    res.status(200).json({ message: 'Data anggota JKT48 telah dimuat.', members: membersList });
  } catch (error) {
    console.error('Error fetching member list:', error.message);
    res.status(500).json({ error: 'Error fetching member list.' });
  }
});

// Endpoint untuk pencarian anggota berdasarkan nama
app.get('/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Parameter query tidak ditemukan.' });
  }

  // Cari anggota berdasarkan nama
  const searchResults = searchMemberByName(query);
  res.json(searchResults);
});

// Fungsi untuk mencari anggota berdasarkan nama
function searchMemberByName(query) {
  query = query.trim().toLowerCase();
  return membersList.filter(member =>
    member.name.toLowerCase().includes(query)
  );
}

module.exports = app;
