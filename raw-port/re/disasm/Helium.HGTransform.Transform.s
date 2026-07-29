__ZNK11HGTransform9TransformEPfPKfi:
00000000001b55e0	testl	%ecx, %ecx
00000000001b55e2	jle	0x1b5726
00000000001b55e8	pushq	%rbp
00000000001b55e9	movq	%rsp, %rbp
00000000001b55ec	subq	$0x80, %rsp
00000000001b55f3	movupd	0x10(%rdi), %xmm0
00000000001b55f8	movupd	0x20(%rdi), %xmm1
00000000001b55fd	movupd	0x30(%rdi), %xmm2
00000000001b5602	movupd	0x40(%rdi), %xmm3
00000000001b5607	movupd	0x60(%rdi), %xmm4
00000000001b560c	movupd	0x50(%rdi), %xmm5
00000000001b5611	movupd	0x80(%rdi), %xmm6
00000000001b5619	movupd	0x70(%rdi), %xmm7
00000000001b561e	xorl	%r8d, %r8d
00000000001b5621	cmpl	$0x1, %ecx
00000000001b5624	je	0x1b5652
00000000001b5626	leal	-0x1(%rcx), %eax
00000000001b5629	shlq	$0x4, %rax
00000000001b562d	leaq	(%rsi,%rax), %rdi
00000000001b5631	addq	$0x10, %rdi
00000000001b5635	addq	%rdx, %rax
00000000001b5638	addq	$0x10, %rax
00000000001b563c	cmpq	%rax, %rsi
00000000001b563f	setb	%al
00000000001b5642	cmpq	%rdi, %rdx
00000000001b5645	setb	%dil
00000000001b5649	testb	%dil, %al
00000000001b564c	je	0x1b5727
00000000001b5652	movq	%rsi, %rax
00000000001b5655	movq	%rdx, %rdi
00000000001b5658	subl	%r8d, %ecx
00000000001b565b	xorl	%edx, %edx
00000000001b565d	nopl	(%rax)
00000000001b5660	movss	(%rdi,%rdx), %xmm8
00000000001b5666	movss	0x4(%rdi,%rdx), %xmm9
00000000001b566d	cvtss2sd	%xmm8, %xmm8
00000000001b5672	cvtss2sd	%xmm9, %xmm9
00000000001b5677	movss	0x8(%rdi,%rdx), %xmm10
00000000001b567e	cvtss2sd	%xmm10, %xmm10
00000000001b5683	movss	0xc(%rdi,%rdx), %xmm11
00000000001b568a	cvtss2sd	%xmm11, %xmm11
00000000001b568f	movddup	%xmm8, %xmm8                    ## xmm8 = xmm8[0,0]
00000000001b5694	movapd	%xmm1, %xmm12
00000000001b5699	mulpd	%xmm8, %xmm12
00000000001b569e	mulpd	%xmm0, %xmm8
00000000001b56a3	movddup	%xmm9, %xmm9                    ## xmm9 = xmm9[0,0]
00000000001b56a8	movapd	%xmm3, %xmm13
00000000001b56ad	mulpd	%xmm9, %xmm13
00000000001b56b2	addpd	%xmm12, %xmm13
00000000001b56b7	mulpd	%xmm2, %xmm9
00000000001b56bc	addpd	%xmm8, %xmm9
00000000001b56c1	movddup	%xmm10, %xmm8                   ## xmm8 = xmm10[0,0]
00000000001b56c6	movapd	%xmm5, %xmm10
00000000001b56cb	mulpd	%xmm8, %xmm10
00000000001b56d0	addpd	%xmm9, %xmm10
00000000001b56d5	mulpd	%xmm4, %xmm8
00000000001b56da	addpd	%xmm13, %xmm8
00000000001b56df	movddup	%xmm11, %xmm9                   ## xmm9 = xmm11[0,0]
00000000001b56e4	movapd	%xmm6, %xmm11
00000000001b56e9	mulpd	%xmm9, %xmm11
00000000001b56ee	addpd	%xmm8, %xmm11
00000000001b56f3	mulpd	%xmm7, %xmm9
00000000001b56f8	addpd	%xmm10, %xmm9
00000000001b56fd	cvtpd2ps	%xmm11, %xmm8
00000000001b5702	cvtpd2ps	%xmm9, %xmm9
00000000001b5707	unpcklpd	%xmm8, %xmm9                    ## xmm9 = xmm9[0],xmm8[0]
00000000001b570c	movupd	%xmm9, (%rax,%rdx)
00000000001b5712	addq	$0x10, %rdx
00000000001b5716	decl	%ecx
00000000001b5718	jne	0x1b5660
00000000001b571e	addq	$0x80, %rsp
00000000001b5725	popq	%rbp
00000000001b5726	retq
00000000001b5727	movl	%ecx, %r9d
00000000001b572a	movl	%r9d, %r8d
00000000001b572d	andl	$0x7ffffffe, %r8d               ## imm = 0x7FFFFFFE
00000000001b5734	movq	%r8, %rdi
00000000001b5737	shlq	$0x4, %rdi
00000000001b573b	leaq	(%rsi,%rdi), %rax
00000000001b573f	addq	%rdx, %rdi
00000000001b5742	movddup	%xmm0, %xmm8                    ## xmm8 = xmm0[0,0]
00000000001b5747	movapd	%xmm8, -0x100(%rbp)
00000000001b5750	movddup	%xmm2, %xmm8                    ## xmm8 = xmm2[0,0]
00000000001b5755	movapd	%xmm8, -0xf0(%rbp)
00000000001b575e	movddup	%xmm5, %xmm8                    ## xmm8 = xmm5[0,0]
00000000001b5763	movapd	%xmm8, -0xe0(%rbp)
00000000001b576c	movddup	%xmm7, %xmm8                    ## xmm8 = xmm7[0,0]
00000000001b5771	movapd	%xmm8, -0xd0(%rbp)
00000000001b577a	movapd	%xmm0, %xmm8
00000000001b577f	unpckhpd	%xmm0, %xmm8                    ## xmm8 = xmm8[1],xmm0[1]
00000000001b5784	movapd	%xmm8, -0xc0(%rbp)
00000000001b578d	movapd	%xmm2, %xmm8
00000000001b5792	unpckhpd	%xmm2, %xmm8                    ## xmm8 = xmm8[1],xmm2[1]
00000000001b5797	movapd	%xmm8, -0xb0(%rbp)
00000000001b57a0	movapd	%xmm5, %xmm8
00000000001b57a5	unpckhpd	%xmm5, %xmm8                    ## xmm8 = xmm8[1],xmm5[1]
00000000001b57aa	movapd	%xmm8, -0xa0(%rbp)
00000000001b57b3	movapd	%xmm7, %xmm8
00000000001b57b8	unpckhpd	%xmm7, %xmm8                    ## xmm8 = xmm8[1],xmm7[1]
00000000001b57bd	movapd	%xmm8, -0x90(%rbp)
00000000001b57c6	movddup	%xmm1, %xmm8                    ## xmm8 = xmm1[0,0]
00000000001b57cb	movapd	%xmm8, -0x80(%rbp)
00000000001b57d1	movddup	%xmm3, %xmm8                    ## xmm8 = xmm3[0,0]
00000000001b57d6	movapd	%xmm8, -0x70(%rbp)
00000000001b57dc	movddup	%xmm4, %xmm8                    ## xmm8 = xmm4[0,0]
00000000001b57e1	movapd	%xmm8, -0x60(%rbp)
00000000001b57e7	movddup	%xmm6, %xmm8                    ## xmm8 = xmm6[0,0]
00000000001b57ec	movapd	%xmm8, -0x50(%rbp)
00000000001b57f2	movapd	%xmm1, %xmm8
00000000001b57f7	unpckhpd	%xmm1, %xmm8                    ## xmm8 = xmm8[1],xmm1[1]
00000000001b57fc	movapd	%xmm8, -0x40(%rbp)
00000000001b5802	movapd	%xmm3, %xmm8
00000000001b5807	unpckhpd	%xmm3, %xmm8                    ## xmm8 = xmm8[1],xmm3[1]
00000000001b580c	movapd	%xmm8, -0x30(%rbp)
00000000001b5812	movapd	%xmm4, %xmm8
00000000001b5817	unpckhpd	%xmm4, %xmm8                    ## xmm8 = xmm8[1],xmm4[1]
00000000001b581c	movapd	%xmm8, -0x20(%rbp)
00000000001b5822	movapd	%xmm6, %xmm8
00000000001b5827	unpckhpd	%xmm6, %xmm8                    ## xmm8 = xmm8[1],xmm6[1]
00000000001b582c	movapd	%xmm8, -0x10(%rbp)
00000000001b5832	xorl	%r10d, %r10d
00000000001b5835	movq	%r8, %r11
00000000001b5838	nopl	(%rax,%rax)
00000000001b5840	movups	(%rdx,%r10), %xmm8
00000000001b5845	movups	0x10(%rdx,%r10), %xmm15
00000000001b584b	movaps	%xmm8, %xmm11
00000000001b584f	insertps	$0x1c, %xmm15, %xmm11           ## xmm11 = xmm11[0],xmm15[0],zero,zero
00000000001b5856	movaps	%xmm15, %xmm14
00000000001b585a	insertps	$0x4c, %xmm8, %xmm14            ## xmm14 = xmm8[1],xmm14[1],zero,zero
00000000001b5861	movaps	%xmm8, %xmm12
00000000001b5865	unpckhps	%xmm15, %xmm12                  ## xmm12 = xmm12[2],xmm15[2],xmm12[3],xmm15[3]
00000000001b5869	shufps	$0x33, %xmm8, %xmm15            ## xmm15 = xmm15[3,0],xmm8[3,0]
00000000001b586e	cvtps2pd	%xmm11, %xmm13
00000000001b5872	shufps	$0xe2, %xmm8, %xmm15            ## xmm15 = xmm15[2,0],xmm8[2,3]
00000000001b5877	movapd	-0x100(%rbp), %xmm8
00000000001b5880	cvtps2pd	%xmm14, %xmm11
00000000001b5884	mulpd	%xmm13, %xmm8
00000000001b5889	movapd	-0xf0(%rbp), %xmm9
00000000001b5892	mulpd	%xmm11, %xmm9
00000000001b5897	addpd	%xmm8, %xmm9
00000000001b589c	cvtps2pd	%xmm12, %xmm14
00000000001b58a0	movapd	-0xe0(%rbp), %xmm12
00000000001b58a9	mulpd	%xmm14, %xmm12
00000000001b58ae	addpd	%xmm9, %xmm12
00000000001b58b3	cvtps2pd	%xmm15, %xmm15
00000000001b58b7	movapd	-0xd0(%rbp), %xmm8
00000000001b58c0	mulpd	%xmm15, %xmm8
00000000001b58c5	addpd	%xmm12, %xmm8
00000000001b58ca	movapd	-0xc0(%rbp), %xmm9
00000000001b58d3	mulpd	%xmm13, %xmm9
00000000001b58d8	movapd	-0xb0(%rbp), %xmm12
00000000001b58e1	mulpd	%xmm11, %xmm12
00000000001b58e6	addpd	%xmm9, %xmm12
00000000001b58eb	movapd	-0xa0(%rbp), %xmm9
00000000001b58f4	mulpd	%xmm14, %xmm9
00000000001b58f9	addpd	%xmm12, %xmm9
00000000001b58fe	movapd	-0x90(%rbp), %xmm12
00000000001b5907	mulpd	%xmm15, %xmm12
00000000001b590c	addpd	%xmm9, %xmm12
00000000001b5911	movapd	-0x80(%rbp), %xmm9
00000000001b5917	mulpd	%xmm13, %xmm9
00000000001b591c	movapd	-0x70(%rbp), %xmm10
00000000001b5922	mulpd	%xmm11, %xmm10
00000000001b5927	addpd	%xmm9, %xmm10
00000000001b592c	movapd	-0x60(%rbp), %xmm9
00000000001b5932	mulpd	%xmm14, %xmm9
00000000001b5937	addpd	%xmm10, %xmm9
00000000001b593c	movapd	-0x50(%rbp), %xmm10
00000000001b5942	mulpd	%xmm15, %xmm10
00000000001b5947	addpd	%xmm9, %xmm10
00000000001b594c	mulpd	-0x40(%rbp), %xmm13
00000000001b5952	mulpd	-0x30(%rbp), %xmm11
00000000001b5958	addpd	%xmm13, %xmm11
00000000001b595d	mulpd	-0x20(%rbp), %xmm14
00000000001b5963	addpd	%xmm11, %xmm14
00000000001b5968	mulpd	-0x10(%rbp), %xmm15
00000000001b596e	cvtpd2ps	%xmm12, %xmm9
00000000001b5973	addpd	%xmm14, %xmm15
00000000001b5978	cvtpd2ps	%xmm8, %xmm8
00000000001b597d	unpcklpd	%xmm9, %xmm8                    ## xmm8 = xmm8[0],xmm9[0]
00000000001b5982	cvtpd2ps	%xmm15, %xmm9
00000000001b5987	cvtpd2ps	%xmm10, %xmm10
00000000001b598c	unpcklpd	%xmm9, %xmm10                   ## xmm10 = xmm10[0],xmm9[0]
00000000001b5991	movapd	%xmm8, %xmm9
00000000001b5996	shufps	$0x88, %xmm10, %xmm9            ## xmm9 = xmm9[0,2],xmm10[0,2]
00000000001b599b	shufps	$0xdd, %xmm10, %xmm8            ## xmm8 = xmm8[1,3],xmm10[1,3]
00000000001b59a0	movups	%xmm8, 0x10(%rsi,%r10)
00000000001b59a6	movups	%xmm9, (%rsi,%r10)
00000000001b59ab	addq	$0x20, %r10
00000000001b59af	addq	$-0x2, %r11
00000000001b59b3	jne	0x1b5840
00000000001b59b9	cmpl	%r9d, %r8d
00000000001b59bc	jne	0x1b5658
00000000001b59c2	jmp	0x1b571e
00000000001b59c7	nopw	(%rax,%rax)
