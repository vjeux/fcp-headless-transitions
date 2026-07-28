__ZN25CustomPixelFormatRegistryD1Ev:
00000000012e2920	pushq	%rbp
00000000012e2921	movq	%rsp, %rbp
00000000012e2924	pushq	%r14
00000000012e2926	pushq	%rbx
00000000012e2927	movq	%rdi, %rbx
00000000012e292a	callq	__ZN25CustomPixelFormatRegistry5clearEv ## CustomPixelFormatRegistry::clear()
00000000012e292f	movq	(%rbx), %r14
00000000012e2932	testq	%r14, %r14
00000000012e2935	je	0x12e2947
00000000012e2937	movq	%r14, %rdi
00000000012e293a	callq	__ZN16FFSynchronizableD1Ev      ## FFSynchronizable::~FFSynchronizable()
00000000012e293f	movq	%r14, %rdi
00000000012e2942	callq	0x1497404                       ## symbol stub for: __ZdlPv
00000000012e2947	movq	0x10(%rbx), %rsi
00000000012e294b	addq	$0x8, %rbx
00000000012e294f	movq	%rbx, %rdi
00000000012e2952	popq	%rbx
00000000012e2953	popq	%r14
00000000012e2955	popq	%rbp
00000000012e2956	jmp	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
00000000012e295b	movq	%rax, %rdi
00000000012e295e	callq	___clang_call_terminate
00000000012e2963	nopw	%cs:(%rax,%rax)
