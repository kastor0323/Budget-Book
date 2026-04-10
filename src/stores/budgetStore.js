// stores/budgetStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useBudgetStore = defineStore('store', {
  state: () => ({
    totalCount:0,
    totalIncome: 0,
    totalExpenditure: 0
  }),

  actions: {
    async fetchAll() {
      const [incomeRes, expenditureRes] = await Promise.all([
        axios.get('http://localhost:3000/income'),
        axios.get('http://localhost:3000/expenditure')
      ])

      const income = incomeRes.data
      const expenditure = expenditureRes.data

      //건수
      this. totalCount = income.length + expenditure.length

      //금액
      this.totalIncome = incomeRes.data.reduce((sum, item) => sum + item.money, 0)
      this.totalExpenditure = expenditureRes.data.reduce((sum, item) => sum + item.money, 0)
    },
  }
})