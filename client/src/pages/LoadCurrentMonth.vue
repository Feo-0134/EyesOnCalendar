<template>
  <AccessCell />
</template>

<script>
import AccessCell from '@/components/AccessCell'
import moment from 'moment'
var store = require('store')
export default {
  components: {AccessCell},
  data() {
    return {
      current: "Loading current month..."
    }
  },
  created() {
    // if(store.get('user').team === 'default') {
    //   this.$router.push('/portal')
    // } else {
    //   this.$router.push(store.get('user').team + moment().format('/YYYY/M'))
    // }
  },
}
</script>