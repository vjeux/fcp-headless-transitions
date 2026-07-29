__ZNK13HGColorMatrix4infoEiRKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_:
00000000001b8cf0	testl	%edx, %edx
00000000001b8cf2	jle	0x1b8d23
00000000001b8cf4	pushq	%rbp
00000000001b8cf5	movq	%rsp, %rbp
00000000001b8cf8	pushq	%rbx
00000000001b8cf9	pushq	%rax
00000000001b8cfa	movq	%r8, %r9
00000000001b8cfd	movq	%rcx, %r8
00000000001b8d00	addq	$0x1b0, %rsi                    ## imm = 0x1B0
00000000001b8d07	movq	%rdi, %rbx
00000000001b8d0a	movl	$0x4, %edx
00000000001b8d0f	movl	$0x4, %ecx
00000000001b8d14	callq	__ZN13HGLoggerUtils18matrixPrettyStringEPKfiiRKNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEESA_ ## HGLoggerUtils::matrixPrettyString(float const*, int, int, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&)
00000000001b8d19	movq	%rbx, %rax
00000000001b8d1c	addq	$0x8, %rsp
00000000001b8d20	popq	%rbx
00000000001b8d21	popq	%rbp
00000000001b8d22	retq
00000000001b8d23	xorps	%xmm0, %xmm0
00000000001b8d26	movups	%xmm0, (%rdi)
00000000001b8d29	movq	$0x0, 0x10(%rdi)
00000000001b8d31	movq	%rdi, %rax
00000000001b8d34	retq
00000000001b8d35	addb	%al, (%rax)
00000000001b8d37	addb	%al, (%rax)
00000000001b8d39	addb	%al, (%rax)
00000000001b8d3b	addb	%al, (%rax)
00000000001b8d3d	addb	%al, (%rax)
00000000001b8d3f	addb	%dl, 0x48(%rbp)
00000000001b8d42	movl	%esp, %ebp
00000000001b8d44	movq	0x8(%rdi), %rax
00000000001b8d48	movslq	%esi, %rcx
00000000001b8d4b	imulq	$0x38, %rcx, %rcx
00000000001b8d4f	movq	0x30(%rax,%rcx), %rdx
00000000001b8d54	pmovsxdq	%xmm0, %xmm0
00000000001b8d59	movdqu	(%rax,%rcx), %xmm1
00000000001b8d5e	psubq	%xmm1, %xmm0
00000000001b8d62	pextrq	$0x1, %xmm0, %rax
00000000001b8d69	imulq	(%rdx), %rax
00000000001b8d6d	movq	%xmm0, %rcx
00000000001b8d72	shlq	$0x4, %rcx
00000000001b8d76	addq	0x8(%rdx), %rax
00000000001b8d7a	movaps	(%rcx,%rax), %xmm0
00000000001b8d7e	popq	%rbp
00000000001b8d7f	retq
