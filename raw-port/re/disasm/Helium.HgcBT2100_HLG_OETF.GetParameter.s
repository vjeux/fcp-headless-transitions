__ZN18HgcBT2100_HLG_OETF12GetParameterEiPf:
00000000003b1290	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000003b1295	cmpl	$0x1, %esi
00000000003b1298	ja	0x3b12d8
00000000003b129a	pushq	%rbp
00000000003b129b	movq	%rsp, %rbp
00000000003b129e	movq	0x198(%rdi), %rax
00000000003b12a5	movl	%esi, %ecx
00000000003b12a7	shlq	$0x5, %rcx
00000000003b12ab	movss	(%rax,%rcx), %xmm0
00000000003b12b0	movss	%xmm0, (%rdx)
00000000003b12b4	movss	0x4(%rax,%rcx), %xmm0
00000000003b12ba	movss	%xmm0, 0x4(%rdx)
00000000003b12bf	movss	0x8(%rax,%rcx), %xmm0
00000000003b12c5	movss	%xmm0, 0x8(%rdx)
00000000003b12ca	movss	0xc(%rax,%rcx), %xmm0
00000000003b12d0	movss	%xmm0, 0xc(%rdx)
00000000003b12d5	xorl	%eax, %eax
00000000003b12d7	popq	%rbp
00000000003b12d8	retq
00000000003b12d9	nopl	(%rax)
