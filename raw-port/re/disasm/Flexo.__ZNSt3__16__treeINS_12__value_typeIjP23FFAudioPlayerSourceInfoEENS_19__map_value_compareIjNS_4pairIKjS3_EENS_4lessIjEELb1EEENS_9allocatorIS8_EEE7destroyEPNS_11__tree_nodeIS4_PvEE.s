__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE:
000000000005d170	testq	%rsi, %rsi
000000000005d173	je	0x5d1a5
000000000005d175	pushq	%rbp
000000000005d176	movq	%rsp, %rbp
000000000005d179	pushq	%r14
000000000005d17b	pushq	%rbx
000000000005d17c	movq	(%rsi), %rax
000000000005d17f	movq	%rdi, %rbx
000000000005d182	movq	%rsi, %r14
000000000005d185	movq	%rax, %rsi
000000000005d188	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
000000000005d18d	movq	0x8(%r14), %rsi
000000000005d191	movq	%rbx, %rdi
000000000005d194	callq	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
000000000005d199	movq	%r14, %rdi
000000000005d19c	popq	%rbx
000000000005d19d	popq	%r14
000000000005d19f	popq	%rbp
000000000005d1a0	jmp	0x1497404                       ## symbol stub for: __ZdlPv
000000000005d1a5	retq
000000000005d1a6	nopw	%cs:(%rax,%rax)
