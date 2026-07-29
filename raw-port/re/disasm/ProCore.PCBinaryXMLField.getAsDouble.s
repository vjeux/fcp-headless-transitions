__ZNK16PCBinaryXMLField11getAsDoubleEPd:
000000000006682e	movl	(%rdi), %ecx
0000000000066830	movb	$0x1, %al
0000000000066832	cmpq	$0x5, %rcx
0000000000066836	ja	0x668ca
000000000006683c	pushq	%rbp
000000000006683d	movq	%rsp, %rbp
0000000000066840	pushq	%r14
0000000000066842	pushq	%rbx
0000000000066843	movq	%rsi, %rbx
0000000000066846	leaq	0x7f(%rip), %rdx
000000000006684d	movslq	(%rdx,%rcx,4), %rcx
0000000000066851	addq	%rdx, %rcx
0000000000066854	jmpq	*%rcx
0000000000066856	cvtsi2sdq	0x8(%rdi), %xmm0
000000000006685c	jmp	0x66888
000000000006685e	cvtss2sd	0x18(%rdi), %xmm0
0000000000066863	jmp	0x66888
0000000000066865	movsd	0x10(%rdi), %xmm0
000000000006686a	unpcklps	0xbcfff(%rip), %xmm0            ## xmm0 = xmm0[0],mem[0],xmm0[1],mem[1]
0000000000066871	subpd	0xbd007(%rip), %xmm0
0000000000066879	haddpd	%xmm0, %xmm0
000000000006687d	movlpd	%xmm0, (%rbx)
0000000000066881	jmp	0x668c6
0000000000066883	movsd	0x20(%rdi), %xmm0
0000000000066888	movsd	%xmm0, (%rbx)
000000000006688c	jmp	0x668c6
000000000006688e	addq	$0x40, %rdi
0000000000066892	callq	__ZNK8PCString10createCStrEv    ## PCString::createCStr() const
0000000000066897	movq	%rax, %r14
000000000006689a	callq	0xde726                         ## symbol stub for: ___error
000000000006689f	movl	$0x0, (%rax)
00000000000668a5	movq	%r14, %rdi
00000000000668a8	xorl	%esi, %esi
00000000000668aa	callq	0xdeb8e                         ## symbol stub for: _strtod
00000000000668af	movsd	%xmm0, (%rbx)
00000000000668b3	movq	%r14, %rdi
00000000000668b6	callq	0xde89a                         ## symbol stub for: _free
00000000000668bb	callq	0xde726                         ## symbol stub for: ___error
00000000000668c0	cmpl	$0x22, (%rax)
00000000000668c3	setne	%al
00000000000668c6	popq	%rbx
00000000000668c7	popq	%r14
00000000000668c9	popq	%rbp
00000000000668ca	retq
00000000000668cb	nop
00000000000668cc	movb	%bh, %bh
00000000000668ce	.byte 0xff #bad opcode
00000000000668cf	lcalll	*-0x6d000001(%rcx)
00000000000668d5	.byte 0xff #bad opcode
00000000000668d6	.byte 0xff #bad opcode
00000000000668d7	pushq	-0x5000001(%rdi)
00000000000668dd	.byte 0xff #bad opcode
00000000000668de	.byte 0xff #bad opcode
00000000000668df	incl	%edx
00000000000668e1	.byte 0xff #bad opcode
00000000000668e2	.byte 0xff #bad opcode
00000000000668e3	callq	*0x48(%rbp)
00000000000668e6	movl	%esp, %ebp
00000000000668e8	movq	0x90(%rdi), %rcx
00000000000668ef	testq	%rcx, %rcx
00000000000668f2	je	0x66921
00000000000668f4	movq	%rdi, %rax
00000000000668f7	addq	$0x90, %rax
00000000000668fd	movq	%rax, %rdi
0000000000066900	xorl	%r8d, %r8d
0000000000066903	cmpl	%esi, 0x20(%rcx)
0000000000066906	setb	%r8b
000000000006690a	cmovaeq	%rcx, %rdi
000000000006690e	movq	(%rcx,%r8,8), %rcx
0000000000066912	testq	%rcx, %rcx
0000000000066915	jne	0x66900
0000000000066917	cmpq	%rax, %rdi
000000000006691a	je	0x66921
000000000006691c	cmpl	0x20(%rdi), %esi
000000000006691f	jae	0x66925
0000000000066921	xorl	%eax, %eax
0000000000066923	popq	%rbp
0000000000066924	retq
0000000000066925	addq	$0x28, %rdi
0000000000066929	movq	%rdx, %rsi
000000000006692c	popq	%rbp
000000000006692d	jmp	__ZNK16PCBinaryXMLField9getAsBoolEPb ## PCBinaryXMLField::getAsBool(bool*) const
