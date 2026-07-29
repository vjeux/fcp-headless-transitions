__ZN11HGTransform9LoadOrthoEffffff:
00000000001b4730	pushq	%rbp
00000000001b4731	movq	%rsp, %rbp
00000000001b4734	pushq	%rbx
00000000001b4735	subq	$0x58, %rsp
00000000001b4739	movss	%xmm5, -0xc(%rbp)
00000000001b473e	movaps	%xmm4, -0x60(%rbp)
00000000001b4742	movaps	%xmm3, -0x40(%rbp)
00000000001b4746	movaps	%xmm2, -0x50(%rbp)
00000000001b474a	movaps	%xmm1, -0x20(%rbp)
00000000001b474e	movaps	%xmm0, -0x30(%rbp)
00000000001b4752	movq	%rdi, %rbx
00000000001b4755	movq	(%rdi), %rax
00000000001b4758	callq	*0x38(%rax)
00000000001b475b	movaps	-0x20(%rbp), %xmm2
00000000001b475f	insertps	$0x10, -0x40(%rbp), %xmm2       ## xmm2 = xmm2[0],mem[0],xmm2[2,3]
00000000001b4766	movaps	-0x30(%rbp), %xmm1
00000000001b476a	insertps	$0x10, -0x50(%rbp), %xmm1       ## xmm1 = xmm1[0],mem[0],xmm1[2,3]
00000000001b4771	movaps	%xmm2, %xmm0
00000000001b4774	movaps	%xmm2, %xmm7
00000000001b4777	subps	%xmm1, %xmm0
00000000001b477a	movaps	%xmm1, %xmm6
00000000001b477d	xorps	%xmm1, %xmm1
00000000001b4780	cvtss2sd	%xmm0, %xmm1
00000000001b4784	movsd	0x216a04(%rip), %xmm2
00000000001b478c	movapd	%xmm2, %xmm3
00000000001b4790	divsd	%xmm1, %xmm3
00000000001b4794	movsd	%xmm3, 0x10(%rbx)
00000000001b4799	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000001b479d	cvtss2sd	%xmm1, %xmm1
00000000001b47a1	divsd	%xmm1, %xmm2
00000000001b47a5	movsd	%xmm2, 0x38(%rbx)
00000000001b47aa	movss	-0xc(%rbp), %xmm4
00000000001b47af	movaps	%xmm4, %xmm1
00000000001b47b2	movaps	-0x60(%rbp), %xmm5
00000000001b47b6	subss	%xmm5, %xmm1
00000000001b47ba	xorps	%xmm2, %xmm2
00000000001b47bd	cvtss2sd	%xmm1, %xmm2
00000000001b47c1	movsd	0x21c75f(%rip), %xmm3
00000000001b47c9	divsd	%xmm2, %xmm3
00000000001b47cd	addps	%xmm7, %xmm6
00000000001b47d0	movaps	0x2158f9(%rip), %xmm2
00000000001b47d7	xorps	%xmm2, %xmm6
00000000001b47da	divps	%xmm0, %xmm6
00000000001b47dd	cvtps2pd	%xmm6, %xmm0
00000000001b47e0	movsd	%xmm3, 0x60(%rbx)
00000000001b47e5	movups	%xmm0, 0x70(%rbx)
00000000001b47e9	movaps	%xmm5, %xmm0
00000000001b47ec	addss	%xmm4, %xmm0
00000000001b47f0	xorps	%xmm2, %xmm0
00000000001b47f3	divss	%xmm1, %xmm0
00000000001b47f7	cvtss2sd	%xmm0, %xmm0
00000000001b47fb	movsd	%xmm0, 0x80(%rbx)
00000000001b4803	addq	$0x58, %rsp
00000000001b4807	popq	%rbx
00000000001b4808	popq	%rbp
00000000001b4809	retq
00000000001b480a	nopw	(%rax,%rax)
