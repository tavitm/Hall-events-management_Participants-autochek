import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')
  const hash = async (p: string) => bcrypt.hash(p, 12)

  const superadmin = await prisma.user.upsert({ where: { email: 'admin@usab-tm.ro' }, update: {}, create: { name: 'Super Administrator USVT', email: 'admin@usab-tm.ro', password: await hash('Admin@2024!'), role: 'superadmin', isActive: true } })
  const administrator = await prisma.user.upsert({ where: { email: 'manager@usab-tm.ro' }, update: {}, create: { name: 'Manager Evenimente', email: 'manager@usab-tm.ro', password: await hash('Manager@2024!'), role: 'administrator', isActive: true } })
  const imagine = await prisma.user.upsert({ where: { email: 'imagine@usab-tm.ro' }, update: {}, create: { name: 'Departament Imagine USVT', email: 'imagine@usab-tm.ro', password: await hash('Imagine@2024!'), role: 'imagine', department: 'Departament Imagine', isActive: true } })
  const rectorat = await prisma.user.upsert({ where: { email: 'rectorat@usab-tm.ro' }, update: {}, create: { name: 'Reprezentant Rectorat', email: 'rectorat@usab-tm.ro', password: await hash('Rectorat@2024!'), role: 'rectorat', isActive: true } })
  const orgFA = await prisma.user.upsert({ where: { email: 'org.fa@usab-tm.ro' }, update: {}, create: { name: 'Organizator Agricultură', email: 'org.fa@usab-tm.ro', password: await hash('Org@2024!'), role: 'organizator', organizatorType: 'intern', organizatorEntity: 'Facultatea de Agricultură', isActive: true } })
  const orgFITA = await prisma.user.upsert({ where: { email: 'org.fita@usab-tm.ro' }, update: {}, create: { name: 'Organizator Inginerie', email: 'org.fita@usab-tm.ro', password: await hash('Org@2024!'), role: 'organizator', organizatorType: 'intern', organizatorEntity: 'Facultatea de Inginerie și Tehnologii Aplicate', isActive: true } })
  const orgLiga = await prisma.user.upsert({ where: { email: 'liga@usab-tm.ro' }, update: {}, create: { name: 'Liga Studențească USVT', email: 'liga@usab-tm.ro', password: await hash('Liga@2024!'), role: 'organizator', organizatorType: 'intern', organizatorEntity: 'Liga Studențească USVT', isActive: true } })
  const voluntar1 = await prisma.user.upsert({ where: { email: 'voluntar1@stud.usab-tm.ro' }, update: {}, create: { name: 'Maria Ionescu', email: 'voluntar1@stud.usab-tm.ro', password: await hash('Voluntar@2024!'), role: 'voluntar', isActive: true } })
  const voluntar2 = await prisma.user.upsert({ where: { email: 'voluntar2@stud.usab-tm.ro' }, update: {}, create: { name: 'Alexandru Popescu', email: 'voluntar2@stud.usab-tm.ro', password: await hash('Voluntar@2024!'), role: 'voluntar', isActive: true } })
  const agrocampus = await prisma.user.upsert({ where: { email: 'agrocampus@usab-tm.ro' }, update: {}, create: { name: 'Agrocampus Catering', email: 'agrocampus@usab-tm.ro', password: await hash('Agro@2024!'), role: 'agrocampus', isActive: true } })
  const tehnic = await prisma.user.upsert({ where: { email: 'tehnic@extern.ro' }, update: {}, create: { name: 'Furnizor Tehnic SRL', email: 'tehnic@extern.ro', password: await hash('Tehnic@2024!'), role: 'tehnic', isActive: true } })
  const auditor = await prisma.user.upsert({ where: { email: 'auditor@usab-tm.ro' }, update: {}, create: { name: 'Auditor USVT', email: 'auditor@usab-tm.ro', password: await hash('Audit@2024!'), role: 'auditor', isActive: true } })
  console.log('✅ Users created')

  const aulaMagna = await prisma.space.upsert({ where: { id: 'space-aula-magna' }, update: {}, create: { id: 'space-aula-magna', name: 'Aula Magna', type: 'conferinta', capacity: 300, building: 'Corp Principal', floor: 'Parter', description: 'Sala principală', isActive: true } })
  const salaConfA = await prisma.space.upsert({ where: { id: 'space-conf-a' }, update: {}, create: { id: 'space-conf-a', name: 'Sala Conferințe A', type: 'conferinta', capacity: 80, building: 'Corp A', floor: '1', isActive: true } })
  const salaTeh = await prisma.space.upsert({ where: { id: 'space-tech-1' }, update: {}, create: { id: 'space-tech-1', name: 'Sala Tehnică/Organizare', type: 'tehnica', capacity: 20, building: 'Corp Principal', floor: 'Parter', isActive: true } })
  const coffee1 = await prisma.space.upsert({ where: { id: 'space-coffee-1' }, update: {}, create: { id: 'space-coffee-1', name: 'Foyer Corp Principal', type: 'coffee_break', capacity: 100, building: 'Corp Principal', floor: 'Parter', isActive: true } })
  const salaConfB = await prisma.space.upsert({ where: { id: 'space-conf-b' }, update: {}, create: { id: 'space-conf-b', name: 'Sala Conferințe B', type: 'conferinta', capacity: 50, building: 'Corp B', floor: '2', isActive: true } })
  const amfi = await prisma.space.upsert({ where: { id: 'space-amfi' }, update: {}, create: { id: 'space-amfi', name: 'Amfiteatru', type: 'conferinta', capacity: 150, building: 'Corp C', floor: '1', isActive: true } })
  console.log('✅ Spaces created')

  const now = new Date()
  const d = (days: number, h: number, m = 0) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, h, m)

  const ev1 = await prisma.event.upsert({ where: { id: 'ev-conf-agri-2025' }, update: {}, create: { id: 'ev-conf-agri-2025', title: 'Conferința Internațională de Agricultură Sustenabilă 2025', description: 'Conferință anuală dedicată cercetărilor și inovațiilor în domeniul agriculturii sustenabile.', eventType: 'conferinta', startDate: d(7, 9), endDate: d(7, 18), setupStartDate: d(6, 14), setupEndDate: d(6, 18), organizatorId: orgFA.id, organizatorName: 'Facultatea de Agricultură', organizatorType: 'intern', organizatorEntity: 'Facultatea de Agricultură', status: 'validated', estimatedParticipants: 120, technicalNotes: 'Sistem traducere simultană RO/EN, 3 microfoane wireless, streaming live', cateringRequired: true, cateringType: 'agrocampus', coffeeBreakCount: 120, lunchCount: 80, isPublic: true, websiteUrl: 'https://conf-agri.usab-tm.ro', eventSpaces: { create: [{ spaceId: aulaMagna.id, role: 'main' }, { spaceId: salaTeh.id, role: 'technical' }, { spaceId: coffee1.id, role: 'coffee_break' }] }, equipment: { create: [{ name: 'Proiector', quantity: 2, provider: 'intern' }, { name: 'Sistem audio', quantity: 1, provider: 'intern' }, { name: 'Microfon wireless', quantity: 3, provider: 'intern' }, { name: 'Sistem streaming live', quantity: 1, provider: 'tehnic_extern' }] } } })
  const ev2 = await prisma.event.upsert({ where: { id: 'ev-workshop-it-2025' }, update: {}, create: { id: 'ev-workshop-it-2025', title: 'Workshop Tehnologii AI în Inginerie', description: 'Workshop practic dedicat aplicațiilor AI în inginerie.', eventType: 'workshop', startDate: d(3, 10), endDate: d(3, 16), organizatorId: orgFITA.id, organizatorType: 'intern', organizatorEntity: 'Facultatea de Inginerie și Tehnologii Aplicate', status: 'approved', estimatedParticipants: 45, cateringRequired: true, cateringType: 'agrocampus', coffeeBreakCount: 45, isPublic: true, eventSpaces: { create: [{ spaceId: salaConfA.id, role: 'main' }] }, equipment: { create: [{ name: 'Proiector', quantity: 1, provider: 'intern' }] } } })
  const ev3 = await prisma.event.upsert({ where: { id: 'ev-gala-2025' }, update: {}, create: { id: 'ev-gala-2025', title: 'Gala Studenților USVT 2025', description: 'Ceremonia anuală de premiere a studenților excelenți.', eventType: 'gala', startDate: d(30, 18), endDate: d(30, 22), organizatorId: orgLiga.id, organizatorType: 'intern', organizatorEntity: 'Liga Studențească USVT', status: 'submitted', estimatedParticipants: 250, cateringRequired: true, cateringType: 'both', dinnerCount: 250, isPublic: true, eventSpaces: { create: [{ spaceId: aulaMagna.id, role: 'main' }, { spaceId: coffee1.id, role: 'coffee_break' }] } } })
  const ev4 = await prisma.event.upsert({ where: { id: 'ev-seminar-vet' }, update: {}, create: { id: 'ev-seminar-vet', title: 'Seminar Boli Emergente la Animale', eventType: 'seminar', startDate: d(14, 9), endDate: d(14, 13), organizatorId: superadmin.id, organizatorType: 'intern', organizatorEntity: 'Facultatea de Medicină Veterinară Timișoara', status: 'draft', estimatedParticipants: 60, isPublic: true, eventSpaces: { create: [{ spaceId: amfi.id, role: 'main' }] } } })
  console.log('✅ Events created')

  await prisma.volunteerRecord.upsert({ where: { eventId_userId: { eventId: ev1.id, userId: voluntar1.id } }, update: {}, create: { eventId: ev1.id, userId: voluntar1.id, status: 'preregistered', role: 'Înregistrare participanți' } })
  await prisma.volunteerRecord.upsert({ where: { eventId_userId: { eventId: ev1.id, userId: voluntar2.id } }, update: {}, create: { eventId: ev1.id, userId: voluntar2.id, status: 'preregistered', role: 'Suport tehnic' } })
  await prisma.volunteerRecord.upsert({ where: { eventId_userId: { eventId: ev2.id, userId: voluntar1.id } }, update: {}, create: { eventId: ev2.id, userId: voluntar1.id, status: 'checked_in', role: 'Moderare', checkedInAt: new Date() } })
  console.log('✅ Volunteer records created')

  await prisma.observation.create({ data: { eventId: ev1.id, userId: orgFA.id, content: 'Vă rog să confirmați disponibilitatea sistemului de traducere simultană. Avem 3 vorbitori internaționali EN.', category: 'technical' } })
  await prisma.observation.create({ data: { eventId: ev1.id, userId: imagine.id, content: 'Confirmat streaming. Vom posta live pe pagina Facebook USVT. Pregătiți materialele grafice până pe 10 mai.', category: 'general' } })
  await prisma.observation.create({ data: { eventId: ev1.id, userId: agrocampus.id, content: 'Catering confirmat: 120 coffee break + 80 prânz. Meniu: buffet cu produse locale USVT.', category: 'catering' } })
  console.log('✅ Observations created')

  await prisma.certificate.upsert({ where: { eventId_userId_type: { eventId: ev2.id, userId: voluntar1.id, type: 'voluntar' } }, update: {}, create: { eventId: ev2.id, userId: voluntar1.id, certificateNo: 'USVT-2025-00042', type: 'voluntar' } })
  console.log('✅ Certificates created')

  console.log('\n🎉 Done!\n')
  console.log('Credentials:')
  console.log('  admin@usab-tm.ro / Admin@2024!')
  console.log('  manager@usab-tm.ro / Manager@2024!')
  console.log('  imagine@usab-tm.ro / Imagine@2024!')
  console.log('  rectorat@usab-tm.ro / Rectorat@2024!')
  console.log('  org.fa@usab-tm.ro / Org@2024!')
  console.log('  voluntar1@stud.usab-tm.ro / Voluntar@2024!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
