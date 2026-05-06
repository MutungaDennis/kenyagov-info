// data/governors.ts

export type Governor = {
  id: number;
  name: string;
  county: string;
  countySlug: string;
  party: string;
  region: string;
  deputyGovernor: string;
};

export const governors: Governor[] = [
  { id: 1, name: "Abdullswamad Shariff Nassir", county: "Mombasa", countySlug: "mombasa", party: "ODM", region: "Coast", deputyGovernor: "Francis Thoya" },
  { id: 2, name: "Fatuma Mohamed Achani", county: "Kwale", countySlug: "kwale", party: "UDA", region: "Coast", deputyGovernor: "Josephat Chirema Kombo" },
  { id: 3, name: "Gideon Mung'aro", county: "Kilifi", countySlug: "kilifi", party: "ODM", region: "Coast", deputyGovernor: "Chibule Flora Margaret" },
  { id: 4, name: "Dhadho Gaddae Godhana", county: "Tana River", countySlug: "tana-river", party: "UDA", region: "Coast", deputyGovernor: "Mahadh Ali Loka" },
  { id: 5, name: "Issa Abdallah Timamy", county: "Lamu", countySlug: "lamu", party: "JUBILEE", region: "Coast", deputyGovernor: "Ndung'u Raphael Munya" },
  { id: 6, name: "Andrew Mwadime", county: "Taita Taveta", countySlug: "taita-taveta", party: "ODM", region: "Coast", deputyGovernor: "Christine Ruth Saru Kilalo" },
  { id: 7, name: "Nathif Jama", county: "Garissa", countySlug: "garissa", party: "JUBILEE", region: "North Eastern", deputyGovernor: "Abdi Muhumed Dagane" },
  { id: 8, name: "Ahmed Abdullahi", county: "Wajir", countySlug: "wajir", party: "UDM", region: "North Eastern", deputyGovernor: "Ahmed Muhumed Abdi" },
  { id: 9, name: "Mohamed Adan Khalif", county: "Mandera", countySlug: "mandera", party: "UDM", region: "North Eastern", deputyGovernor: "Ali Mohamud Maalim" },
  { id: 10, name: "Mohamud Ali", county: "Marsabit", countySlug: "marsabit", party: "UDA", region: "Eastern", deputyGovernor: "Solomon Gubo Riwe" },
  { id: 11, name: "Abdi Hassan Guyo", county: "Isiolo", countySlug: "isiolo", party: "UDA", region: "Eastern", deputyGovernor: "Lowasa James" },
  { id: 12, name: "Kawira Mwangaza", county: "Meru", countySlug: "meru", party: "Independent", region: "Eastern", deputyGovernor: "M'Ethingia Mutuma Isaac" },
  { id: 13, name: "Muthomi Njuki", county: "Tharaka Nithi", countySlug: "tharaka-nithi", party: "UDA", region: "Eastern", deputyGovernor: "Muisrael Nyaga Derebia" },
  { id: 14, name: "Cecily Mbarire", county: "Embu", countySlug: "embu", party: "UDA", region: "Eastern", deputyGovernor: "Mugo Justus Kinywa" },
  { id: 15, name: "Julius Malombe", county: "Kitui", countySlug: "kitui", party: "WDM-K", region: "Eastern", deputyGovernor: "Kanani Augustine Wambua" },
  { id: 16, name: "Wavinya Ndeti", county: "Machakos", countySlug: "machakos", party: "WDM-K", region: "Eastern", deputyGovernor: "Francis Mwangangi Kilonzo" },
  { id: 17, name: "Mutula Kilonzo", county: "Makueni", countySlug: "makueni", party: "WDM-K", region: "Eastern", deputyGovernor: "Mulili Lucy Mumbua" },
  { id: 18, name: "Moses Badilisha Kiarie", county: "Nyandarua", countySlug: "nyandarua", party: "UDA", region: "Central", deputyGovernor: "Mwangi John Mathara" },
  { id: 19, name: "Mutahi Kahiga", county: "Nyeri", countySlug: "nyeri", party: "UDA", region: "Central", deputyGovernor: "David Mwangi Kinaniri Waroe" },
  { id: 20, name: "Anne Mumbi Waiguru", county: "Kirinyaga", countySlug: "kirinyaga", party: "UDA", region: "Central", deputyGovernor: "Wachira David Githanda" },
  { id: 21, name: "Irungu Kang'ata", county: "Murang'a", countySlug: "muranga", party: "UDA", region: "Central", deputyGovernor: "Stephen Mburu Munania" },
  { id: 22, name: "Kimani Wamatangi", county: "Kiambu", countySlug: "kiambu", party: "UDA", region: "Central", deputyGovernor: "Kirika Rosemary Njeri" },
  { id: 23, name: "Jeremiah Lomurkai", county: "Turkana", countySlug: "turkana", party: "UDA", region: "Rift Valley", deputyGovernor: "John Erus Lopeyok" },
  { id: 24, name: "Simon Kachapin", county: "West Pokot", countySlug: "west-pokot", party: "UDA", region: "Rift Valley", deputyGovernor: "Achaule Robert Komolle" },
  { id: 25, name: "Jonathan Lati Leleliit", county: "Samburu", countySlug: "samburu", party: "UDA", region: "Rift Valley", deputyGovernor: "Samia Gabriel Lenengwezi" },
  { id: 26, name: "George Natembeya", county: "Trans Nzoia", countySlug: "trans-nzoia", party: "UDA", region: "Rift Valley", deputyGovernor: "Bineah Philomenah Chebetibin" },
  { id: 27, name: "Jonathan Bii", county: "Uasin Gishu", countySlug: "uasin-gishu", party: "UDA", region: "Rift Valley", deputyGovernor: "Barorot John Kibet" },
  { id: 28, name: "Wisley Rotich Kipyegon", county: "Elgeyo Marakwet", countySlug: "elgeyo-marakwet", party: "UDA", region: "Rift Valley", deputyGovernor: "Cheserek Grace Jerutich" },
  { id: 29, name: "Stephen Kipyego Sang", county: "Nandi", countySlug: "nandi", party: "UDA", region: "Rift Valley", deputyGovernor: "Yulita Mitei Chebotip" },
  { id: 30, name: "Benjamin Cheboi", county: "Baringo", countySlug: "baringo", party: "UDA", region: "Rift Valley", deputyGovernor: "Felix Kiplagat" },
  { id: 31, name: "Joshua Irungu", county: "Laikipia", countySlug: "laikipia", party: "UDA", region: "Rift Valley", deputyGovernor: "Reuben Kamuri Ngatia" },
  { id: 32, name: "Susan Kihika", county: "Nakuru", countySlug: "nakuru", party: "UDA", region: "Rift Valley", deputyGovernor: "David Kipkemoi Kones" },
  { id: 33, name: "Patrick Ole Ntutu", county: "Narok", countySlug: "narok", party: "UDA", region: "Rift Valley", deputyGovernor: "Kiprono Koech Tamalinye" },
  { id: 34, name: "Joseph Jama Ole Lenku", county: "Kajiado", countySlug: "kajiado", party: "UDA", region: "Rift Valley", deputyGovernor: "Martin Moshisho Martin" },
  { id: 35, name: "Erick Kipkoech Mutai", county: "Kericho", countySlug: "kericho", party: "UDA", region: "Rift Valley", deputyGovernor: "Kirui Fredrick Kipng'etich" },
  { id: 36, name: "Hillary Barchok", county: "Bomet", countySlug: "bomet", party: "UDA", region: "Rift Valley", deputyGovernor: "David Shadrack Rotich" },
  { id: 37, name: "Fernandes Barasa", county: "Kakamega", countySlug: "kakamega", party: "UDA", region: "Western", deputyGovernor: "Ayub Savula" },
  { id: 38, name: "Wilber Khasilwa Ottichilo", county: "Vihiga", countySlug: "vihiga", party: "ODM", region: "Western", deputyGovernor: "Gwadoya Wilberforce Kitiezo" },
  { id: 39, name: "Ken Lusaka", county: "Bungoma", countySlug: "bungoma", party: "ODM", region: "Western", deputyGovernor: "Mbatiany Jenepher Chemtai" },
  { id: 40, name: "Paul Otuoma", county: "Busia", countySlug: "busia", party: "ODM", region: "Western", deputyGovernor: "Odera Arthur Papac" },
  { id: 41, name: "James Orengo", county: "Siaya", countySlug: "siaya", party: "ODM", region: "Nyanza", deputyGovernor: "Oduol William Odhiambo" },
  { id: 42, name: "Peter Anyang’ Nyong’o", county: "Kisumu", countySlug: "kisumu", party: "ODM", region: "Nyanza", deputyGovernor: "Mathew Owili Ochieng" },
  { id: 43, name: "Gladys Atieno Nyasuna Wanga", county: "Homa Bay", countySlug: "homa-bay", party: "ODM", region: "Nyanza", deputyGovernor: "Magwanga Joseph Oyugi" },
  { id: 44, name: "Ochillo Ayacko", county: "Migori", countySlug: "migori", party: "ODM", region: "Nyanza", deputyGovernor: "Mahiri Joseph Gimunta" },
  { id: 45, name: "Paul Simba Arati", county: "Kisii", countySlug: "kisii", party: "ODM", region: "Nyanza", deputyGovernor: "Robert Onsare Monda" },
  { id: 46, name: "Amos Nyaribo Kimwomi", county: "Nyamira", countySlug: "nyamira", party: "UDA", region: "Nyanza", deputyGovernor: "Ondicho James Gesami" },
  { id: 47, name: "Johnson Arthur Sakaja", county: "Nairobi", countySlug: "nairobi", party: "UDA", region: "Nairobi", deputyGovernor: "James Njoroge Muchiri" },
];