_HGRectMake4f:
0000000000107d50	movaps	%xmm1, %xmm4
0000000000107d53	insertps	$0x10, %xmm0, %xmm4             ## xmm4 = xmm4[0],xmm0[0],xmm4[2,3]
0000000000107d59	insertps	$0x10, %xmm2, %xmm3             ## xmm3 = xmm3[0],xmm2[0],xmm3[2,3]
0000000000107d5f	movaps	%xmm3, %xmm2
0000000000107d62	minps	%xmm4, %xmm2
0000000000107d65	movaps	%xmm3, %xmm1
0000000000107d68	maxps	%xmm4, %xmm1
0000000000107d6b	cmpunordps	%xmm4, %xmm4
0000000000107d6f	movaps	%xmm4, %xmm0
0000000000107d72	blendvps	%xmm0, %xmm3, %xmm2
0000000000107d77	blendvps	%xmm0, %xmm3, %xmm1
0000000000107d7c	movaps	%xmm1, %xmm0
0000000000107d7f	cmpltps	%xmm2, %xmm0
0000000000107d83	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000107d86	movmskpd	%xmm0, %eax
0000000000107d8a	testl	%eax, %eax
0000000000107d8c	je	0x107d93
0000000000107d8e	xorl	%edx, %edx
0000000000107d90	xorl	%eax, %eax
0000000000107d92	retq
0000000000107d93	pushq	%rbp
0000000000107d94	movq	%rsp, %rbp
0000000000107d97	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
0000000000107d9b	movss	0x2ca4dd(%rip), %xmm3
0000000000107da3	maxss	%xmm3, %xmm0
0000000000107da7	roundss	$0x9, %xmm0, %xmm0
0000000000107dad	cvttss2si	%xmm0, %eax
0000000000107db1	maxss	%xmm3, %xmm2
0000000000107db5	xorps	%xmm0, %xmm0
0000000000107db8	roundss	$0x9, %xmm2, %xmm0
0000000000107dbe	cvttss2si	%xmm0, %ecx
0000000000107dc2	movaps	0x2ca477(%rip), %xmm2
0000000000107dc9	movaps	%xmm2, %xmm3
0000000000107dcc	minps	%xmm1, %xmm3
0000000000107dcf	cmpunordps	%xmm1, %xmm1
0000000000107dd3	movaps	%xmm1, %xmm0
0000000000107dd6	blendvps	%xmm0, %xmm2, %xmm3
0000000000107ddb	roundps	$0xa, %xmm3, %xmm0
0000000000107de1	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
0000000000107de5	cvttss2si	%xmm1, %edx
0000000000107de9	cmpleps	%xmm0, %xmm2
0000000000107ded	unpcklps	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0,1,1]
0000000000107df0	cvttss2si	%xmm0, %esi
0000000000107df4	movd	%edx, %xmm0
0000000000107df8	movd	%esi, %xmm1
0000000000107dfc	psllq	$0x20, %xmm1
0000000000107e01	punpcklqdq	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
0000000000107e05	movaps	%xmm2, %xmm0
0000000000107e08	blendvpd	%xmm0, 0x2ca45f(%rip), %xmm1
0000000000107e11	pshufd	$0xee, %xmm1, %xmm0             ## xmm0 = xmm1[2,3,2,3]
0000000000107e16	por	%xmm1, %xmm0
0000000000107e1a	movq	%xmm0, %rdx
0000000000107e1f	shlq	$0x20, %rcx
0000000000107e23	orq	%rcx, %rax
0000000000107e26	popq	%rbp
0000000000107e27	retq
0000000000107e28	nopl	(%rax,%rax)
