export interface AcademicYearSelect {
  id: number
  yearStart: number
  yearEnd: number
  semester: 'ganjil' | 'genap'
  isCurrentActiveYear: boolean
  createdAt: string | null
}

export interface CreateAcademicYearDTO {
  yearStart: number
  yearEnd: number
  semester: 'ganjil' | 'genap'
  isCurrentActiveYear?: boolean
}

export interface AcademicYearsResponse {
  years: AcademicYearSelect[]
  activeYearId: number | null
}
