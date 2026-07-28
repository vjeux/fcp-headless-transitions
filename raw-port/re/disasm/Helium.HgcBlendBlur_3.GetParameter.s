__ZN14HgcBlendBlur_312GetParameterEiPf:
0000000000236780	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
0000000000236785	cmpl	$0x4, %esi
0000000000236788	ja	0x2367c8
000000000023678a	pushq	%rbp
000000000023678b	movq	%rsp, %rbp
000000000023678e	movq	0x198(%rdi), %rax
0000000000236795	movl	%esi, %ecx
0000000000236797	shlq	$0x5, %rcx
000000000023679b	movss	(%rax,%rcx), %xmm0
00000000002367a0	movss	%xmm0, (%rdx)
00000000002367a4	movss	0x4(%rax,%rcx), %xmm0
00000000002367aa	movss	%xmm0, 0x4(%rdx)
00000000002367af	movss	0x8(%rax,%rcx), %xmm0
00000000002367b5	movss	%xmm0, 0x8(%rdx)
00000000002367ba	movss	0xc(%rax,%rcx), %xmm0
00000000002367c0	movss	%xmm0, 0xc(%rdx)
00000000002367c5	xorl	%eax, %eax
00000000002367c7	popq	%rbp
00000000002367c8	retq
00000000002367c9	nopl	(%rax)
