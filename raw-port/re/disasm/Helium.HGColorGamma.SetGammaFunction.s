__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_:
00000000000fb830	pushq	%rbp
00000000000fb831	movq	%rsp, %rbp
00000000000fb834	pushq	%r14
00000000000fb836	pushq	%rbx
00000000000fb837	subq	$0x70, %rsp
00000000000fb83b	movaps	%xmm6, -0x30(%rbp)
00000000000fb83f	movaps	%xmm5, -0x20(%rbp)
00000000000fb843	movaps	%xmm4, -0x40(%rbp)
00000000000fb847	movaps	%xmm3, -0x80(%rbp)
00000000000fb84b	movaps	%xmm2, -0x70(%rbp)
00000000000fb84f	movaps	%xmm1, -0x60(%rbp)
00000000000fb853	movaps	%xmm0, -0x50(%rbp)
00000000000fb857	movl	%esi, %r14d
00000000000fb85a	movq	%rdi, %rbx
00000000000fb85d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb862	movaps	-0x50(%rbp), %xmm7
00000000000fb866	movaps	-0x60(%rbp), %xmm6
00000000000fb86a	movaps	-0x70(%rbp), %xmm5
00000000000fb86e	movaps	-0x80(%rbp), %xmm4
00000000000fb872	movb	$0x1, 0x2e9(%rbx)
00000000000fb879	leal	-0x1(%r14), %eax
00000000000fb87d	cmpl	$0x4, %eax
00000000000fb880	ja	0xfb96a
00000000000fb886	leaq	0x29b(%rip), %rcx
00000000000fb88d	movslq	(%rcx,%rax,4), %rax
00000000000fb891	addq	%rcx, %rax
00000000000fb894	jmpq	*%rax
00000000000fb896	movaps	0x2cf123(%rip), %xmm0
00000000000fb89d	movaps	%xmm7, %xmm1
00000000000fb8a0	mulps	%xmm0, %xmm1
00000000000fb8a3	cmpneqps	%xmm0, %xmm1
00000000000fb8a7	movaps	%xmm6, %xmm2
00000000000fb8aa	mulps	%xmm0, %xmm2
00000000000fb8ad	cmpneqps	%xmm0, %xmm2
00000000000fb8b1	mulps	%xmm5, %xmm0
00000000000fb8b4	xorps	%xmm3, %xmm3
00000000000fb8b7	cmpneqps	%xmm0, %xmm3
00000000000fb8bb	orps	%xmm2, %xmm3
00000000000fb8be	orps	%xmm1, %xmm3
00000000000fb8c1	movmskps	%xmm3, %eax
00000000000fb8c4	testl	%eax, %eax
00000000000fb8c6	jne	0xfb96a
00000000000fb8cc	jmp	0xfba03
00000000000fb8d1	movaps	0x2cf0e8(%rip), %xmm0
00000000000fb8d8	movaps	%xmm7, %xmm1
00000000000fb8db	mulps	%xmm0, %xmm1
00000000000fb8de	cmpneqps	%xmm0, %xmm1
00000000000fb8e2	movaps	%xmm6, %xmm2
00000000000fb8e5	mulps	%xmm0, %xmm2
00000000000fb8e8	cmpneqps	%xmm0, %xmm2
00000000000fb8ec	orps	%xmm1, %xmm2
00000000000fb8ef	movaps	%xmm5, %xmm1
00000000000fb8f2	addps	-0x20(%rbp), %xmm1
00000000000fb8f6	mulps	%xmm0, %xmm1
00000000000fb8f9	xorps	%xmm3, %xmm3
00000000000fb8fc	cmpneqps	%xmm3, %xmm1
00000000000fb900	orps	%xmm2, %xmm1
00000000000fb903	movaps	%xmm4, %xmm2
00000000000fb906	mulps	%xmm0, %xmm2
00000000000fb909	cmpneqps	%xmm0, %xmm2
00000000000fb90d	mulps	-0x30(%rbp), %xmm0
00000000000fb911	cmpneqps	%xmm3, %xmm0
00000000000fb915	orps	%xmm2, %xmm0
00000000000fb918	orps	%xmm1, %xmm0
00000000000fb91b	movmskps	%xmm0, %eax
00000000000fb91e	testl	%eax, %eax
00000000000fb920	jne	0xfb96a
00000000000fb922	jmp	0xfba03
00000000000fb927	movaps	0x2cf092(%rip), %xmm0
00000000000fb92e	movaps	%xmm7, %xmm1
00000000000fb931	mulps	%xmm0, %xmm1
00000000000fb934	cmpneqps	%xmm0, %xmm1
00000000000fb938	movaps	%xmm6, %xmm2
00000000000fb93b	mulps	%xmm0, %xmm2
00000000000fb93e	cmpneqps	%xmm0, %xmm2
00000000000fb942	orps	%xmm1, %xmm2
00000000000fb945	movaps	%xmm5, %xmm1
00000000000fb948	mulps	%xmm0, %xmm1
00000000000fb94b	xorps	%xmm3, %xmm3
00000000000fb94e	cmpneqps	%xmm3, %xmm1
00000000000fb952	mulps	%xmm4, %xmm0
00000000000fb955	cmpneqps	%xmm3, %xmm0
00000000000fb959	orps	%xmm1, %xmm0
00000000000fb95c	orps	%xmm2, %xmm0
00000000000fb95f	movmskps	%xmm0, %eax
00000000000fb962	testl	%eax, %eax
00000000000fb964	je	0xfba03
00000000000fb96a	movl	%r14d, 0x404(%rbx)
00000000000fb971	movl	$0x0, 0x408(%rbx)
00000000000fb97b	movaps	%xmm7, 0x300(%rbx)
00000000000fb982	movaps	%xmm6, 0x310(%rbx)
00000000000fb989	movaps	%xmm5, 0x320(%rbx)
00000000000fb990	movaps	%xmm4, 0x330(%rbx)
00000000000fb997	movaps	-0x40(%rbp), %xmm3
00000000000fb99b	movaps	%xmm3, 0x340(%rbx)
00000000000fb9a2	movaps	-0x20(%rbp), %xmm2
00000000000fb9a6	movaps	%xmm2, 0x350(%rbx)
00000000000fb9ad	movaps	-0x30(%rbp), %xmm1
00000000000fb9b1	movaps	%xmm1, 0x360(%rbx)
00000000000fb9b8	jmp	0xfba58
00000000000fb9bd	movaps	0x2ceffc(%rip), %xmm0
00000000000fb9c4	movaps	%xmm7, %xmm1
00000000000fb9c7	mulps	%xmm0, %xmm1
00000000000fb9ca	cmpneqps	%xmm0, %xmm1
00000000000fb9ce	movaps	%xmm6, %xmm2
00000000000fb9d1	mulps	%xmm0, %xmm2
00000000000fb9d4	cmpneqps	%xmm0, %xmm2
00000000000fb9d8	orps	%xmm1, %xmm2
00000000000fb9db	movaps	%xmm5, %xmm1
00000000000fb9de	mulps	%xmm0, %xmm1
00000000000fb9e1	xorps	%xmm3, %xmm3
00000000000fb9e4	cmpneqps	%xmm1, %xmm3
00000000000fb9e8	movaps	%xmm4, %xmm1
00000000000fb9eb	mulps	%xmm0, %xmm1
00000000000fb9ee	cmpneqps	%xmm0, %xmm1
00000000000fb9f2	orps	%xmm3, %xmm1
00000000000fb9f5	orps	%xmm2, %xmm1
00000000000fb9f8	movmskps	%xmm1, %eax
00000000000fb9fb	testl	%eax, %eax
00000000000fb9fd	jne	0xfb96a
00000000000fba03	movq	$0x0, 0x404(%rbx)
00000000000fba0e	movaps	0x2cc22b(%rip), %xmm7
00000000000fba15	movaps	%xmm7, 0x300(%rbx)
00000000000fba1c	xorps	%xmm6, %xmm6
00000000000fba1f	movaps	%xmm6, 0x310(%rbx)
00000000000fba26	movaps	%xmm6, 0x320(%rbx)
00000000000fba2d	movaps	%xmm6, 0x330(%rbx)
00000000000fba34	movaps	%xmm6, 0x340(%rbx)
00000000000fba3b	movaps	%xmm6, 0x350(%rbx)
00000000000fba42	movaps	%xmm6, 0x360(%rbx)
00000000000fba49	xorps	%xmm1, %xmm1
00000000000fba4c	xorps	%xmm2, %xmm2
00000000000fba4f	xorps	%xmm3, %xmm3
00000000000fba52	xorps	%xmm4, %xmm4
00000000000fba55	xorps	%xmm5, %xmm5
00000000000fba58	movshdup	%xmm7, %xmm0                    ## xmm0 = xmm7[1,1,3,3]
00000000000fba5c	xorl	%eax, %eax
00000000000fba5e	ucomiss	%xmm0, %xmm7
00000000000fba61	jne	0xfbb18
00000000000fba67	jp	0xfbb18
00000000000fba6d	movhlps	%xmm7, %xmm7                    ## xmm7 = xmm7[1,1]
00000000000fba70	ucomiss	%xmm7, %xmm0
00000000000fba73	jne	0xfbb18
00000000000fba79	jp	0xfbb18
00000000000fba7f	movshdup	%xmm6, %xmm0                    ## xmm0 = xmm6[1,1,3,3]
00000000000fba83	xorl	%eax, %eax
00000000000fba85	ucomiss	%xmm0, %xmm6
00000000000fba88	jne	0xfbb18
00000000000fba8e	jp	0xfbb18
00000000000fba94	movhlps	%xmm6, %xmm6                    ## xmm6 = xmm6[1,1]
00000000000fba97	ucomiss	%xmm6, %xmm0
00000000000fba9a	jne	0xfbb18
00000000000fba9c	jp	0xfbb18
00000000000fba9e	movshdup	%xmm5, %xmm0                    ## xmm0 = xmm5[1,1,3,3]
00000000000fbaa2	xorl	%eax, %eax
00000000000fbaa4	ucomiss	%xmm0, %xmm5
00000000000fbaa7	jne	0xfbb18
00000000000fbaa9	jp	0xfbb18
00000000000fbaab	movhlps	%xmm5, %xmm5                    ## xmm5 = xmm5[1,1]
00000000000fbaae	ucomiss	%xmm5, %xmm0
00000000000fbab1	jne	0xfbb18
00000000000fbab3	jp	0xfbb18
00000000000fbab5	movshdup	%xmm4, %xmm0                    ## xmm0 = xmm4[1,1,3,3]
00000000000fbab9	xorl	%eax, %eax
00000000000fbabb	ucomiss	%xmm0, %xmm4
00000000000fbabe	jne	0xfbb18
00000000000fbac0	jp	0xfbb18
00000000000fbac2	movhlps	%xmm4, %xmm4                    ## xmm4 = xmm4[1,1]
00000000000fbac5	ucomiss	%xmm4, %xmm0
00000000000fbac8	jne	0xfbb18
00000000000fbaca	jp	0xfbb18
00000000000fbacc	movshdup	%xmm3, %xmm0                    ## xmm0 = xmm3[1,1,3,3]
00000000000fbad0	xorl	%eax, %eax
00000000000fbad2	ucomiss	%xmm0, %xmm3
00000000000fbad5	jne	0xfbb18
00000000000fbad7	jp	0xfbb18
00000000000fbad9	movhlps	%xmm3, %xmm3                    ## xmm3 = xmm3[1,1]
00000000000fbadc	ucomiss	%xmm3, %xmm0
00000000000fbadf	jne	0xfbb18
00000000000fbae1	jp	0xfbb18
00000000000fbae3	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
00000000000fbae7	xorl	%eax, %eax
00000000000fbae9	ucomiss	%xmm0, %xmm2
00000000000fbaec	jne	0xfbb18
00000000000fbaee	jp	0xfbb18
00000000000fbaf0	movhlps	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000000fbaf3	ucomiss	%xmm2, %xmm0
00000000000fbaf6	jne	0xfbb18
00000000000fbaf8	jp	0xfbb18
00000000000fbafa	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
00000000000fbafe	ucomiss	%xmm0, %xmm1
00000000000fbb01	jne	0xfbb16
00000000000fbb03	jp	0xfbb16
00000000000fbb05	movhlps	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
00000000000fbb08	cmpeqss	%xmm0, %xmm1
00000000000fbb0d	movd	%xmm1, %eax
00000000000fbb11	andl	$0x1, %eax
00000000000fbb14	jmp	0xfbb18
00000000000fbb16	xorl	%eax, %eax
00000000000fbb18	movb	%al, 0x370(%rbx)
00000000000fbb1e	addq	$0x70, %rsp
00000000000fbb22	popq	%rbx
00000000000fbb23	popq	%r14
00000000000fbb25	popq	%rbp
00000000000fbb26	retq
00000000000fbb27	nop
00000000000fbb28	outsb	(%rsi), %dx
00000000000fbb29	std
00000000000fbb2a	.byte 0xff #bad opcode
00000000000fbb2b	.byte 0xff #bad opcode
00000000000fbb2c	.byte 0xff #bad opcode
00000000000fbb2d	std
00000000000fbb2e	.byte 0xff #bad opcode
00000000000fbb2f	callq	*-0x56000002(%rbp)
00000000000fbb35	std
00000000000fbb36	.byte 0xff #bad opcode
00000000000fbb37	.byte 0xff #bad opcode
00000000000fbb38	.byte 0xdb #bad opcode
00000000000fbb39	.byte 0xfe #bad opcode
00000000000fbb3a	.byte 0xff #bad opcode
00000000000fbb3b	decl	(%rdi)
00000000000fbb3d	.byte 0x1f #bad opcode
00000000000fbb3e	addb	%dl, 0x48(%rbp)
00000000000fbb42	movl	%esp, %ebp
00000000000fbb44	pushq	%r14
00000000000fbb46	pushq	%rbx
00000000000fbb47	movl	%esi, %ebx
00000000000fbb49	movq	%rdi, %r14
00000000000fbb4c	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fbb51	movb	$0x1, 0x2e9(%r14)
00000000000fbb59	movl	$0x5, 0x404(%r14)
00000000000fbb64	movl	%ebx, 0x408(%r14)
00000000000fbb6b	movaps	0x2cc0ce(%rip), %xmm0
00000000000fbb72	movaps	%xmm0, 0x300(%r14)
00000000000fbb7a	xorps	%xmm0, %xmm0
00000000000fbb7d	movaps	%xmm0, 0x310(%r14)
00000000000fbb85	movaps	%xmm0, 0x320(%r14)
00000000000fbb8d	movaps	%xmm0, 0x330(%r14)
00000000000fbb95	movaps	%xmm0, 0x340(%r14)
00000000000fbb9d	movaps	%xmm0, 0x350(%r14)
00000000000fbba5	movaps	%xmm0, 0x360(%r14)
00000000000fbbad	movb	$0x1, 0x370(%r14)
00000000000fbbb5	popq	%rbx
00000000000fbbb6	popq	%r14
00000000000fbbb8	popq	%rbp
00000000000fbbb9	retq
00000000000fbbba	nopw	(%rax,%rax)
