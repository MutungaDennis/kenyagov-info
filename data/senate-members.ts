// data/senate-members.ts

export type Senator = {
  id: number;
  name: string;
  county: string;
  party: string;
  type: "Elected" | "Nominated";
  slug: string;
};

export const senateMembers: Senator[] = [
  // 1. Mombasa
  { id: 1, name: "Mwinyihaji, Mohamed Faki", county: "Mombasa", party: "ODM", type: "Elected", slug: "mohamed-faki-mwinyihaji" },
  { id: 2, name: "Abdulrahman, Miraj Abdullahi", county: "Mombasa", party: "UDA", type: "Nominated", slug: "miraj-abdullahi-abdulrahman" },
  { id: 3, name: "Asige, Crystal Kegehi", county: "Mombasa", party: "ODM", type: "Nominated", slug: "crystal-kegehi-asige" },

  // 2. Kwale
  { id: 4, name: "Boy, Issa Juma", county: "Kwale", party: "ODM", type: "Elected", slug: "issa-juma-boy" },
  { id: 5, name: "Mwinzagu, Raphael Chimera", county: "Kwale", party: "UDA", type: "Nominated", slug: "raphael-chimera-mwinzagu" },

  // 3. Kilifi
  { id: 6, name: "Madzayo, Stewart Mwachiru", county: "Kilifi", party: "ODM", type: "Elected", slug: "stewart-mwachiru-madzayo" },

  // 4. Tana River
  { id: 7, name: "Mungatana, Danson Buya", county: "Tana River", party: "UDA", type: "Elected", slug: "danson-buya-mungatana" },

  // 5. Lamu
  { id: 8, name: "Kamau, Joseph Githuku", county: "Lamu", party: "JUBILEE", type: "Elected", slug: "joseph-githuku-kamau" },
  { id: 9, name: "Mohamed, Shakila Abdalla", county: "Lamu", party: "WDM-K", type: "Nominated", slug: "shakila-abdalla-mohamed" },

  // 6. Taita Taveta
  { id: 10, name: "Mwaruma, Johnes Mwashushe", county: "Taita Taveta", party: "ODM", type: "Elected", slug: "johnes-mwashushe-mwaruma" },

  // 7. Garissa
  { id: 11, name: "Haji, Abdul Mohammed", county: "Garissa", party: "JUBILEE", type: "Elected", slug: "abdul-mohammed-haji" },

  // 8. Wajir
  { id: 12, name: "Abass, Sheikh Mohamed", county: "Wajir", party: "UDM", type: "Elected", slug: "sheikh-mohamed-abass" },

  // 9. Mandera
  { id: 13, name: "Roba, Ali Ibrahim", county: "Mandera", party: "UDM", type: "Elected", slug: "ali-ibrahim-roba" },
  { id: 14, name: "Omar, Mariam Sheikh", county: "Mandera", party: "UDM", type: "Nominated", slug: "mariam-sheikh-omar" },

  // 10. Marsabit
  { id: 15, name: "Chute, Mohamed Said", county: "Marsabit", party: "UDA", type: "Elected", slug: "mohamed-said-chute" },

  // 11. Isiolo
  { id: 16, name: "Adan, Dullo Fatuma", county: "Isiolo", party: "JUBILEE", type: "Elected", slug: "dullo-fatuma-adan" },

  // 12. Meru
  { id: 17, name: "Kathuri, Murungi", county: "Meru", party: "UDA", type: "Elected", slug: "murungi-kathuri" },

  // 13. Tharaka Nithi
  { id: 18, name: "Mwenda, Gataya Mo Fire", county: "Tharaka Nithi", party: "UDA", type: "Elected", slug: "gataya-mo-fire-mwenda" },

  // 14. Embu
  { id: 19, name: "Mundigi, Alexander Munyi", county: "Embu", party: "DP", type: "Elected", slug: "alexander-munyi-mundigi" },

  // 15. Kitui
  { id: 20, name: "Wambua, Enoch Kiio", county: "Kitui", party: "WDM-K", type: "Elected", slug: "enoch-kiio-wambua" },

  // 16. Machakos
  { id: 21, name: "Muthama, Agnes Kavindu", county: "Machakos", party: "WDM-K", type: "Elected", slug: "agnes-kavindu-muthama" },

  // 17. Makueni
  { id: 22, name: "Maanzo, Daniel Kitonga", county: "Makueni", party: "WDM-K", type: "Elected", slug: "daniel-kitonga-maanzo" },

  // 18. Nyandarua
  { id: 23, name: "Methu, John Muhia", county: "Nyandarua", party: "UDA", type: "Elected", slug: "john-muhia-methu" },
  { id: 24, name: "Mbugua, George Mungai", county: "Nyandarua", party: "UDA", type: "Nominated", slug: "george-mungai-mbugua" },

  // 19. Nyeri
  { id: 25, name: "Wamatinga, Wahome", county: "Nyeri", party: "UDA", type: "Elected", slug: "wahome-wamatinga" },

  // 20. Kirinyaga
  { id: 26, name: "Murango, James Kamau", county: "Kirinyaga", party: "UDA", type: "Elected", slug: "james-kamau-murango" },

  // 21. Murang’a
  { id: 27, name: "Ngugi, Joe Joseph Nyutu", county: "Murang’a", party: "UDA", type: "Elected", slug: "joe-joseph-nyutu-ngugi" },

  // 22. Kiambu
  { id: 28, name: "Thangwa, Paul Karungo", county: "Kiambu", party: "UDA", type: "Elected", slug: "paul-karungo-thangwa" },

  // 23. Turkana
  { id: 29, name: "Ekomwa, James Lomenen", county: "Turkana", party: "JUBILEE", type: "Elected", slug: "james-lomenen-ekomwa" },

  // 24. West Pokot
  { id: 30, name: "Recha, Julius Murgor", county: "West Pokot", party: "UDA", type: "Elected", slug: "julius-murgor-recha" },

  // 25. Samburu
  { id: 31, name: "Lelegwe, Steve Ltumbesi", county: "Samburu", party: "UDA", type: "Elected", slug: "steve-ltumbesi-lelegwe" },
  { id: 32, name: "Lemaletian, Hezena", county: "Samburu", party: "UDA", type: "Nominated", slug: "hezena-lemaletian" },

  // 26. Trans Nzoia
  { id: 33, name: "Chesang, Allan Kiprotich", county: "Trans Nzoia", party: "UDA", type: "Elected", slug: "allan-kiprotich-chesang" },

  // 27. Uasin Gishu
  { id: 34, name: "Mandago, Jackson Kiplagat", county: "Uasin Gishu", party: "UDA", type: "Elected", slug: "jackson-kiplagat-mandago" },
  { id: 35, name: "Kamar, Margaret Jepkoech", county: "Uasin Gishu", party: "JUBILEE", type: "Nominated", slug: "margaret-jepkoech-kamar" },

  // 28. Elgeyo Marakwet
  { id: 36, name: "Kisang, William Kipkemoi", county: "Elgeyo Marakwet", party: "UDA", type: "Elected", slug: "william-kipkemoi-kisang" },

  // 29. Nandi
  { id: 37, name: "Cherarkey, Samson", county: "Nandi", party: "UDA", type: "Elected", slug: "samson-cherarkey" },

  // 30. Baringo
  { id: 38, name: "Tuitoek, Aaron Cheruiyot", county: "Baringo", party: "UDA", type: "Elected", slug: "aaron-cheruiyot-tuitoek" },

  // 31. Laikipia
  { id: 39, name: "Nderitu, John Kinyua", county: "Laikipia", party: "UDA", type: "Elected", slug: "john-kinyua-nderitu" },

  // 32. Nakuru
  { id: 40, name: "Keroche, Tabitha Karanja", county: "Nakuru", party: "UDA", type: "Elected", slug: "tabitha-karanja-keroche" },

  // 33. Narok
  { id: 41, name: "Olekina, Ledama", county: "Narok", party: "ODM", type: "Elected", slug: "ledama-olekina" },

  // 34. Kajiado
  { id: 42, name: "Seki, Lenku Ole Kanar", county: "Kajiado", party: "UDA", type: "Elected", slug: "lenku-ole-kanar-seki" },
  { id: 43, name: "Montet, Betty Batuli", county: "Kajiado", party: "ODM", type: "Nominated", slug: "betty-batuli-montet" },
  { id: 44, name: "Tobiko, Peris Pesi", county: "Kajiado", party: "UDA", type: "Nominated", slug: "peris-pesi-tobiko" },

  // 35. Kericho
  { id: 45, name: "Cheruiyot, Aaron Kipkirui", county: "Kericho", party: "UDA", type: "Elected", slug: "aaron-kipkirui-cheruiyot" },

  // 36. Bomet
  { id: 46, name: "Wakili, Hillary Kiprotich Sigei", county: "Bomet", party: "UDA", type: "Elected", slug: "hillary-kiprotich-sigei" },
  { id: 47, name: "Korir, Joyce Chepkoech", county: "Bomet", party: "UDA", type: "Nominated", slug: "joyce-chepkoech-korir" },

  // 37. Kakamega
  { id: 48, name: "Khalwale, Boni", county: "Kakamega", party: "UDA", type: "Elected", slug: "boni-khalwale" },

  // 38. Vihiga
  { id: 49, name: "Osotsi, Godfrey Atieno", county: "Vihiga", party: "ODM", type: "Elected", slug: "godfrey-atieno-osotsi" },

  // 39. Bungoma
  { id: 50, name: "Wafula, David Wakoli", county: "Bungoma", party: "FORD-K", type: "Elected", slug: "david-wakoli-wafula" },
  { id: 51, name: "Wakwabubi, Consolata Nabwire", county: "Bungoma", party: "FORD-K", type: "Nominated", slug: "consolata-nabwire-wakwabubi" },

  // 40. Busia
  { id: 52, name: "Okoiti, Andrew Omtatah", county: "Busia", party: "NRA", type: "Elected", slug: "andrew-omtatah-okoiti" },

  // 41. Siaya
  { id: 53, name: "Oginga, Oburu", county: "Siaya", party: "ODM", type: "Elected", slug: "oburu-oginga" },

  // 42. Kisumu
  { id: 54, name: "Ojienda, Odhiambo Tom", county: "Kisumu", party: "ODM", type: "Elected", slug: "odhiambo-tom-ojienda" },

  // 43. Homa Bay
  { id: 55, name: "Kajwang’, Moses Otieno", county: "Homa Bay", party: "ODM", type: "Elected", slug: "moses-otieno-kajwang" },
  { id: 56, name: "Ogolla, Beatrice Akinyi", county: "Homa Bay", party: "ODM", type: "Nominated", slug: "beatrice-akinyi-ogolla" },

  // 44. Migori
  { id: 57, name: "Oketch, Eddy Gicheru", county: "Migori", party: "ODM", type: "Elected", slug: "eddy-gicheru-oketch" },

  // 45. Kisii
  { id: 58, name: "Onyonka, Richard Momoima", county: "Kisii", party: "ODM", type: "Elected", slug: "richard-momoima-onyonka" },
  { id: 59, name: "Okenyuri, Esther Anyieni", county: "Kisii", party: "UDA", type: "Nominated", slug: "esther-anyieni-okenyuri" },

  // 46. Nyamira
  { id: 60, name: "Mogeni, Erick Okong’o", county: "Nyamira", party: "ODM", type: "Elected", slug: "erick-okongo-mogeni" },

  // 47. Nairobi
  { id: 61, name: "Sifuna, Edwine Watenya", county: "Nairobi", party: "ODM", type: "Elected", slug: "edwine-watenya-sifuna" },
  { id: 62, name: "Kibwana, Hamida Ali", county: "Nairobi", party: "ODM", type: "Nominated", slug: "hamida-ali-kibwana" },
  { id: 63, name: "Syengo, Beth Kalunda", county: "Nairobi", party: "ODM", type: "Nominated", slug: "beth-kalunda-syengo" },
  { id: 64, name: "Mutinda, Maureen Tabitha", county: "Nairobi", party: "UDA", type: "Nominated", slug: "maureen-tabitha-mutinda" },
  { id: 65, name: "Nyamu, Karen Njeri", county: "Nairobi", party: "UDA", type: "Nominated", slug: "karen-njeri-nyamu" },
  { id: 66, name: "Maina, Veronica Waheti", county: "Nairobi", party: "UDA", type: "Nominated", slug: "veronica-waheti-maina" },
];