__ZN19cachedPathsForQualsD2Ev:
0000000000fc76c0	pushq	%rbp
0000000000fc76c1	movq	%rsp, %rbp
0000000000fc76c4	pushq	%r15
0000000000fc76c6	pushq	%r14
0000000000fc76c8	pushq	%r12
0000000000fc76ca	pushq	%rbx
0000000000fc76cb	movq	%rdi, %rbx
0000000000fc76ce	movq	(%rdi), %r12
0000000000fc76d1	leaq	0x8(%rdi), %r14
0000000000fc76d5	cmpq	%r14, %r12
0000000000fc76d8	je	0xfc772f
0000000000fc76da	movq	0x926027(%rip), %r15            ## literal pool symbol address: _objc_release
0000000000fc76e1	jmp	0xfc76f8
0000000000fc76e3	nopw	%cs:(%rax,%rax)
0000000000fc76f0	movq	%rax, %r12
0000000000fc76f3	cmpq	%r14, %rax
0000000000fc76f6	je	0xfc772f
0000000000fc76f8	movq	0x28(%r12), %rdi
0000000000fc76fd	callq	*%r15
0000000000fc7700	movq	0x8(%r12), %rcx
0000000000fc7705	testq	%rcx, %rcx
0000000000fc7708	je	0xfc7720
0000000000fc770a	nopw	(%rax,%rax)
0000000000fc7710	movq	%rcx, %rax
0000000000fc7713	movq	(%rcx), %rcx
0000000000fc7716	testq	%rcx, %rcx
0000000000fc7719	jne	0xfc7710
0000000000fc771b	jmp	0xfc76f0
0000000000fc771d	nopl	(%rax)
0000000000fc7720	movq	0x10(%r12), %rax
0000000000fc7725	cmpq	(%rax), %r12
0000000000fc7728	movq	%rax, %r12
0000000000fc772b	jne	0xfc7720
0000000000fc772d	jmp	0xfc76f0
0000000000fc772f	movq	0x8(%rbx), %rsi
0000000000fc7733	movq	%rbx, %rdi
0000000000fc7736	popq	%rbx
0000000000fc7737	popq	%r12
0000000000fc7739	popq	%r14
0000000000fc773b	popq	%r15
0000000000fc773d	popq	%rbp
0000000000fc773e	jmp	__ZNSt3__16__treeINS_12__value_typeIjP23FFAudioPlayerSourceInfoEENS_19__map_value_compareIjNS_4pairIKjS3_EENS_4lessIjEELb1EEENS_9allocatorIS8_EEE7destroyEPNS_11__tree_nodeIS4_PvEE ## std::__1::__tree<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, std::__1::__map_value_compare<unsigned int, std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>, std::__1::less<unsigned int>, true>, std::__1::allocator<std::__1::pair<unsigned int const, FFAudioPlayerSourceInfo*>>>::destroy(std::__1::__tree_node<std::__1::__value_type<unsigned int, FFAudioPlayerSourceInfo*>, void*>*)
0000000000fc7743	movq	%rax, %rdi
0000000000fc7746	callq	___clang_call_terminate
0000000000fc774b	nopl	(%rax,%rax)
