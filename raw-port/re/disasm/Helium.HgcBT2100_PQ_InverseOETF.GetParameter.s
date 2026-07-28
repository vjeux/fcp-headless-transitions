__ZN24HgcBT2100_PQ_InverseOETF12GetParameterEiPf:
00000000003ae790	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000003ae795	cmpl	$0x2, %esi
00000000003ae798	ja	0x3ae7d8
00000000003ae79a	pushq	%rbp
00000000003ae79b	movq	%rsp, %rbp
00000000003ae79e	movq	0x198(%rdi), %rax
00000000003ae7a5	movl	%esi, %ecx
00000000003ae7a7	shlq	$0x5, %rcx
00000000003ae7ab	movss	(%rax,%rcx), %xmm0
00000000003ae7b0	movss	%xmm0, (%rdx)
00000000003ae7b4	movss	0x4(%rax,%rcx), %xmm0
00000000003ae7ba	movss	%xmm0, 0x4(%rdx)
00000000003ae7bf	movss	0x8(%rax,%rcx), %xmm0
00000000003ae7c5	movss	%xmm0, 0x8(%rdx)
00000000003ae7ca	movss	0xc(%rax,%rcx), %xmm0
00000000003ae7d0	movss	%xmm0, 0xc(%rdx)
00000000003ae7d5	xorl	%eax, %eax
00000000003ae7d7	popq	%rbp
00000000003ae7d8	retq
00000000003ae7d9	nopl	(%rax)
