__ZN25HgcBT2100_HLG_InverseOETF12GetParameterEiPf:
00000000003b2170	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000003b2175	cmpl	$0x1, %esi
00000000003b2178	ja	0x3b21b8
00000000003b217a	pushq	%rbp
00000000003b217b	movq	%rsp, %rbp
00000000003b217e	movq	0x198(%rdi), %rax
00000000003b2185	movl	%esi, %ecx
00000000003b2187	shlq	$0x5, %rcx
00000000003b218b	movss	(%rax,%rcx), %xmm0
00000000003b2190	movss	%xmm0, (%rdx)
00000000003b2194	movss	0x4(%rax,%rcx), %xmm0
00000000003b219a	movss	%xmm0, 0x4(%rdx)
00000000003b219f	movss	0x8(%rax,%rcx), %xmm0
00000000003b21a5	movss	%xmm0, 0x8(%rdx)
00000000003b21aa	movss	0xc(%rax,%rcx), %xmm0
00000000003b21b0	movss	%xmm0, 0xc(%rdx)
00000000003b21b5	xorl	%eax, %eax
00000000003b21b7	popq	%rbp
00000000003b21b8	retq
00000000003b21b9	nopl	(%rax)
