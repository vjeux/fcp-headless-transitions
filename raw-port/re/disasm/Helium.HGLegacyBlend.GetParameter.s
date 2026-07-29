__ZN13HGLegacyBlend12GetParameterEiPf:
0000000000241970	pushq	%rbp
0000000000241971	movq	%rsp, %rbp
0000000000241974	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
0000000000241979	cmpl	$0x5, %esi
000000000024197c	ja	0x241a11
0000000000241982	movl	%esi, %ecx
0000000000241984	leaq	0x89(%rip), %rsi
000000000024198b	movslq	(%rsi,%rcx,4), %rcx
000000000024198f	addq	%rsi, %rcx
0000000000241992	jmpq	*%rcx
0000000000241994	cvtsi2ssl	0x1a8(%rdi), %xmm0
000000000024199c	jmp	0x2419a6
000000000024199e	cvtsi2ssl	0x1ac(%rdi), %xmm0
00000000002419a6	movss	%xmm0, (%rdx)
00000000002419aa	movq	$0x0, 0x4(%rdx)
00000000002419b2	xorps	%xmm0, %xmm0
00000000002419b5	jmp	0x241a0a
00000000002419b7	movq	0x1b8(%rdi), %rax
00000000002419be	movss	(%rax), %xmm0
00000000002419c2	movss	%xmm0, (%rdx)
00000000002419c6	movss	0x4(%rax), %xmm0
00000000002419cb	movss	%xmm0, 0x4(%rdx)
00000000002419d0	movss	0x8(%rax), %xmm0
00000000002419d5	movss	%xmm0, 0x8(%rdx)
00000000002419da	movss	0xc(%rax), %xmm0
00000000002419df	jmp	0x241a0a
00000000002419e1	movq	0x1b8(%rdi), %rax
00000000002419e8	movss	0x40(%rax), %xmm0
00000000002419ed	movss	%xmm0, (%rdx)
00000000002419f1	movss	0x44(%rax), %xmm0
00000000002419f6	movss	%xmm0, 0x4(%rdx)
00000000002419fb	movss	0x48(%rax), %xmm0
0000000000241a00	movss	%xmm0, 0x8(%rdx)
0000000000241a05	movss	0x4c(%rax), %xmm0
0000000000241a0a	movss	%xmm0, 0xc(%rdx)
0000000000241a0f	xorl	%eax, %eax
0000000000241a11	popq	%rbp
0000000000241a12	retq
0000000000241a13	nop
0000000000241a14	cmpb	$-0x1, %bh
0000000000241a17	jmpq	*-0x75000001(%rbx)
0000000000241a1d	.byte 0xff #bad opcode
0000000000241a1e	.byte 0xff #bad opcode
0000000000241a1f	.byte 0xff #bad opcode
0000000000241a20	std
0000000000241a21	.byte 0xff #bad opcode
0000000000241a22	.byte 0xff #bad opcode
0000000000241a23	.byte 0xff #bad opcode
0000000000241a24	std
0000000000241a25	.byte 0xff #bad opcode
0000000000241a26	.byte 0xff #bad opcode
0000000000241a27	decl	%ebp
0000000000241a29	.byte 0xff #bad opcode
0000000000241a2a	.byte 0xff #bad opcode
0000000000241a2b	decl	(%rdi)
0000000000241a2d	.byte 0x1f #bad opcode
0000000000241a2e	addb	%dl, 0x48(%rbp)
0000000000241a32	movl	%esp, %ebp
0000000000241a34	movl	%edi, %eax
0000000000241a36	leaq	__ZL18s_func_blend_table(%rip), %rcx ## s_func_blend_table
0000000000241a3d	movq	(%rcx,%rax,8), %rax
0000000000241a41	popq	%rbp
0000000000241a42	retq
0000000000241a43	nopw	%cs:(%rax,%rax)
