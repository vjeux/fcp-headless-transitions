__ZN11HGTransform8Invert2DEv:
00000000001b6060	pushq	%rbp
00000000001b6061	movq	%rsp, %rbp
00000000001b6064	movsd	0x38(%rdi), %xmm3
00000000001b6069	movsd	0x88(%rdi), %xmm1
00000000001b6071	movsd	0x48(%rdi), %xmm6
00000000001b6076	movapd	%xmm6, %xmm7
00000000001b607a	unpcklpd	%xmm1, %xmm7                    ## xmm7 = xmm7[0],xmm1[0]
00000000001b607e	movupd	0x28(%rdi), %xmm0
00000000001b6083	movsd	0x30(%rdi), %xmm8
00000000001b6089	movddup	%xmm6, %xmm9                    ## xmm9 = xmm6[0,0]
00000000001b608e	movapd	%xmm3, %xmm10
00000000001b6093	unpcklpd	%xmm1, %xmm10                   ## xmm10 = xmm10[0],xmm1[0]
00000000001b6098	mulpd	%xmm0, %xmm10
00000000001b609d	movapd	%xmm8, %xmm2
00000000001b60a2	mulsd	%xmm0, %xmm2
00000000001b60a6	movapd	%xmm1, %xmm12
00000000001b60ab	unpcklpd	%xmm0, %xmm12                   ## xmm12 = xmm12[0],xmm0[0]
00000000001b60b0	movupd	0x70(%rdi), %xmm5
00000000001b60b5	movupd	0x10(%rdi), %xmm4
00000000001b60ba	movsd	0x18(%rdi), %xmm11
00000000001b60c0	movapd	%xmm3, %xmm13
00000000001b60c5	movhpd	0x10(%rdi), %xmm13              ## xmm13 = xmm13[0],mem[0]
00000000001b60cb	mulpd	%xmm5, %xmm13
00000000001b60d0	mulsd	%xmm4, %xmm6
00000000001b60d4	subsd	%xmm6, %xmm2
00000000001b60d8	mulsd	%xmm4, %xmm1
00000000001b60dc	movapd	%xmm5, %xmm6
00000000001b60e0	blendpd	$0x1, %xmm3, %xmm6              ## xmm6 = xmm3[0],xmm6[1]
00000000001b60e6	mulsd	%xmm4, %xmm3
00000000001b60ea	mulpd	%xmm12, %xmm6
00000000001b60ef	movapd	%xmm5, %xmm12
00000000001b60f4	unpckhpd	%xmm4, %xmm12                   ## xmm12 = xmm12[1],xmm4[1]
00000000001b60f9	mulpd	%xmm7, %xmm12
00000000001b60fe	subpd	%xmm12, %xmm6
00000000001b6103	movapd	%xmm5, %xmm12
00000000001b6108	shufpd	$0x1, %xmm5, %xmm12             ## xmm12 = xmm12[1],xmm5[0]
00000000001b610e	movapd	%xmm0, %xmm7
00000000001b6112	unpckhpd	%xmm4, %xmm7                    ## xmm7 = xmm7[1],xmm4[1]
00000000001b6116	mulpd	%xmm12, %xmm7
00000000001b611b	subpd	%xmm13, %xmm7
00000000001b6120	movapd	%xmm6, %xmm12
00000000001b6125	mulsd	%xmm4, %xmm12
00000000001b612a	shufpd	$0x1, %xmm5, %xmm4              ## xmm4 = xmm4[1],xmm5[0]
00000000001b612f	mulpd	%xmm9, %xmm4
00000000001b6134	subpd	%xmm10, %xmm4
00000000001b6139	movapd	%xmm4, %xmm9
00000000001b613e	unpckhpd	%xmm4, %xmm9                    ## xmm9 = xmm9[1],xmm4[1]
00000000001b6143	mulsd	%xmm11, %xmm9
00000000001b6148	movapd	%xmm7, %xmm10
00000000001b614d	mulsd	%xmm0, %xmm10
00000000001b6152	mulsd	%xmm11, %xmm8
00000000001b6157	subsd	%xmm8, %xmm3
00000000001b615c	mulsd	%xmm0, %xmm5
00000000001b6160	addsd	%xmm12, %xmm9
00000000001b6165	addsd	%xmm10, %xmm9
00000000001b616a	xorpd	%xmm8, %xmm8
00000000001b616f	movapd	%xmm9, %xmm0
00000000001b6174	cmpeqsd	%xmm8, %xmm0
00000000001b617a	movsd	0x2228d5(%rip), %xmm10
00000000001b6183	blendvpd	%xmm0, %xmm10, %xmm9
00000000001b6189	divsd	%xmm9, %xmm3
00000000001b618e	xorl	%eax, %eax
00000000001b6190	ucomisd	%xmm8, %xmm3
00000000001b6195	setae	%al
00000000001b6198	movapd	0x6a4930(%rip), %xmm0
00000000001b61a0	andpd	%xmm3, %xmm0
00000000001b61a4	leaq	0x6a7225(%rip), %rcx
00000000001b61ab	movsd	(%rcx,%rax,8), %xmm8
00000000001b61b1	cmpnlesd	%xmm10, %xmm0
00000000001b61b7	blendvpd	%xmm0, %xmm3, %xmm8
00000000001b61bd	subsd	%xmm5, %xmm1
00000000001b61c1	movddup	%xmm9, %xmm0                    ## xmm0 = xmm9[0,0]
00000000001b61c6	divpd	%xmm0, %xmm6
00000000001b61ca	movupd	%xmm6, 0x10(%rdi)
00000000001b61cf	divpd	%xmm0, %xmm4
00000000001b61d3	movupd	%xmm4, 0x28(%rdi)
00000000001b61d8	divsd	%xmm9, %xmm1
00000000001b61dd	movsd	%xmm1, 0x38(%rdi)
00000000001b61e2	divsd	%xmm9, %xmm2
00000000001b61e7	movsd	%xmm2, 0x48(%rdi)
00000000001b61ec	divpd	%xmm0, %xmm7
00000000001b61f0	movupd	%xmm7, 0x70(%rdi)
00000000001b61f5	movlpd	%xmm8, 0x88(%rdi)
00000000001b61fe	movq	$0x0, 0x80(%rdi)
00000000001b6209	movq	$0x0, 0x40(%rdi)
00000000001b6211	movq	$0x0, 0x20(%rdi)
00000000001b6219	xorpd	%xmm0, %xmm0
00000000001b621d	movupd	%xmm0, 0x50(%rdi)
00000000001b6222	movsd	0x214036(%rip), %xmm0
00000000001b622a	movups	%xmm0, 0x60(%rdi)
00000000001b622e	popq	%rbp
00000000001b622f	retq
