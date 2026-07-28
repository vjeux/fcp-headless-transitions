__ZN10HgcSampler6CreateEv:
00000000002d3370	pushq	%rbp
00000000002d3371	movq	%rsp, %rbp
00000000002d3374	movl	$0x147, %edi                    ## imm = 0x147
00000000002d3379	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000002d337e	leaq	0x8(%rax), %rdx
00000000002d3382	negl	%edx
00000000002d3384	andl	$0x1f, %edx
00000000002d3387	leaq	(%rdx,%rax), %rcx
00000000002d338b	addq	$0x8, %rcx
00000000002d338f	movq	%rax, (%rdx,%rax)
00000000002d3393	movss	0xf4925(%rip), %xmm0
00000000002d339b	movaps	%xmm0, 0x18(%rdx,%rax)
00000000002d33a0	movaps	%xmm0, 0x8(%rdx,%rax)
00000000002d33a5	movsd	0xf4903(%rip), %xmm0
00000000002d33ad	movaps	%xmm0, 0x38(%rdx,%rax)
00000000002d33b2	movaps	%xmm0, 0x28(%rdx,%rax)
00000000002d33b7	movaps	0xf76b2(%rip), %xmm0
00000000002d33be	movaps	%xmm0, 0x58(%rdx,%rax)
00000000002d33c3	movaps	%xmm0, 0x48(%rdx,%rax)
00000000002d33c8	movaps	0xf6c11(%rip), %xmm0
00000000002d33cf	movaps	%xmm0, 0x78(%rdx,%rax)
00000000002d33d4	movaps	%xmm0, 0x68(%rdx,%rax)
00000000002d33d9	xorps	%xmm0, %xmm0
00000000002d33dc	movaps	%xmm0, 0x88(%rdx,%rax)
00000000002d33e4	movaps	%xmm0, 0x98(%rdx,%rax)
00000000002d33ec	movaps	0xf484d(%rip), %xmm0
00000000002d33f3	movaps	%xmm0, 0xb8(%rdx,%rax)
00000000002d33fb	movaps	%xmm0, 0xa8(%rdx,%rax)
00000000002d3403	movaps	0xf4886(%rip), %xmm0
00000000002d340a	movaps	%xmm0, 0xd8(%rdx,%rax)
00000000002d3412	movaps	%xmm0, 0xc8(%rdx,%rax)
00000000002d341a	movaps	0xf484f(%rip), %xmm0
00000000002d3421	movaps	%xmm0, 0xf8(%rdx,%rax)
00000000002d3429	movaps	%xmm0, 0xe8(%rdx,%rax)
00000000002d3431	movaps	0x5bb948(%rip), %xmm0
00000000002d3438	movaps	%xmm0, 0x118(%rdx,%rax)
00000000002d3440	movaps	%xmm0, 0x108(%rdx,%rax)
00000000002d3448	movq	%rcx, %rax
00000000002d344b	popq	%rbp
00000000002d344c	retq
00000000002d344d	nopl	(%rax)
