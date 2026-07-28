__ZN19cachedPathsForQualsD1Ev:
0000000000fc7750	pushq	%rbp
0000000000fc7751	movq	%rsp, %rbp
0000000000fc7754	pushq	%r15
0000000000fc7756	pushq	%r14
0000000000fc7758	pushq	%r12
0000000000fc775a	pushq	%rbx
0000000000fc775b	movq	%rdi, %rbx
0000000000fc775e	movq	(%rdi), %r12
0000000000fc7761	leaq	0x8(%rdi), %r14
0000000000fc7765	cmpq	%r14, %r12
0000000000fc7768	je	0xfc77bf
0000000000fc776a	movq	0x925f97(%rip), %r15            ## literal pool symbol address: _objc_release
0000000000fc7771	jmp	0xfc7788
0000000000fc7773	nopw	%cs:(%rax,%rax)
0000000000fc7780	movq	%rax, %r12
0000000000fc7783	cmpq	%r14, %rax
0000000000fc7786	je	0xfc77bf
0000000000fc7788	movq	0x28(%r12), %rdi
0000000000fc778d	callq	*%r15
0000000000fc7790	movq	0x8(%r12), %rcx
0000000000fc7795	testq	%rcx, %rcx
0000000000fc7798	je	0xfc77b0
0000000000fc779a	nopw	(%rax,%rax)
0000000000fc77a0	movq	%rcx, %rax
0000000000fc77a3	movq	(%rcx), %rcx
0000000000fc77a6	testq	%rcx, %rcx
0000000000fc77a9	jne	0xfc77a0
0000000000fc77ab	jmp	0xfc7780
0000000000fc77ad	nopl	(%rax)
0000000000fc77b0	movq	0x10(%r12), %rax
0000000000fc77b5	cmpq	(%rax), %r12
0000000000fc77b8	movq	%rax, %r12
0000000000fc77bb	jne	0xfc77b0
0000000000fc77bd	jmp	0xfc7780
0000000000fc77bf	movq	0x8(%rbx), %rsi
0000000000fc77c3	movq	%rbx, %rdi
0000000000fc77c6	popq	%rbx
0000000000fc77c7	popq	%r12
0000000000fc77c9	popq	%r14
0000000000fc77cb	popq	%r15
0000000000fc77cd	popq	%rbp
0000000000fc77ce	jmp	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000fc77d3	movq	%rax, %rdi
0000000000fc77d6	callq	___clang_call_terminate
0000000000fc77db	nopl	(%rax,%rax)
