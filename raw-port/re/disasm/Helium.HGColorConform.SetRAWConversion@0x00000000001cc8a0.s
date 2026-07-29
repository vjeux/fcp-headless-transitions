__ZN14HGColorConform16SetRAWConversionEjjjjffjjPA3_fN12HGColorGamma26hgColorGammaColorPrimariesEfRKNS_13GDCParametersES3_ffPKfNS_30hgColorConformRAWToLogEncodingE:
00000000001cc8a0	pushq	%rbp
00000000001cc8a1	movq	%rsp, %rbp
00000000001cc8a4	pushq	%r15
00000000001cc8a6	pushq	%r14
00000000001cc8a8	pushq	%r13
00000000001cc8aa	pushq	%r12
00000000001cc8ac	pushq	%rbx
00000000001cc8ad	subq	$0x28, %rsp
00000000001cc8b1	movss	%xmm4, -0x38(%rbp)
00000000001cc8b6	movaps	%xmm3, -0x50(%rbp)
00000000001cc8ba	movss	%xmm2, -0x3c(%rbp)
00000000001cc8bf	movl	%r9d, -0x2c(%rbp)
00000000001cc8c3	movss	%xmm1, -0x34(%rbp)
00000000001cc8c8	movss	%xmm0, -0x30(%rbp)
00000000001cc8cd	movl	%r8d, %r12d
00000000001cc8d0	movl	%ecx, %r15d
00000000001cc8d3	movl	%edx, %r13d
00000000001cc8d6	movl	%esi, %r14d
00000000001cc8d9	movq	%rdi, %rbx
00000000001cc8dc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001cc8e1	movl	$0x4, 0x1e4(%rbx)
00000000001cc8eb	movq	%rbx, %rdi
00000000001cc8ee	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001cc8f3	movl	%r14d, 0x228(%rbx)
00000000001cc8fa	movl	%r13d, 0x22c(%rbx)
00000000001cc901	subl	%r15d, %r12d
00000000001cc904	je	0x1cc910
00000000001cc906	xorps	%xmm0, %xmm0
00000000001cc909	cvtsi2ss	%r12, %xmm0
00000000001cc90e	jmp	0x1cc918
00000000001cc910	movss	0x2003dc(%rip), %xmm0
00000000001cc918	movl	%r15d, %eax
00000000001cc91b	xorps	%xmm1, %xmm1
00000000001cc91e	cvtsi2sd	%rax, %xmm1
00000000001cc923	divsd	0x692675(%rip), %xmm1
00000000001cc92b	cvtsd2ss	%xmm1, %xmm1
00000000001cc92f	xorps	%xmm2, %xmm2
00000000001cc932	cvtsi2ss	%rax, %xmm2
00000000001cc937	movss	%xmm0, 0x230(%rbx)
00000000001cc93f	movss	%xmm1, 0x234(%rbx)
00000000001cc947	divss	%xmm0, %xmm2
00000000001cc94b	movss	%xmm2, 0x238(%rbx)
00000000001cc953	movl	-0x2c(%rbp), %eax
00000000001cc956	xorps	%xmm1, %xmm1
00000000001cc959	cvtsi2ss	%rax, %xmm1
00000000001cc95e	movss	-0x30(%rbp), %xmm2
00000000001cc963	movss	%xmm2, 0x23c(%rbx)
00000000001cc96b	movl	0x10(%rbp), %eax
00000000001cc96e	xorps	%xmm2, %xmm2
00000000001cc971	cvtsi2ss	%rax, %xmm2
00000000001cc976	movss	-0x34(%rbp), %xmm3
00000000001cc97b	movss	%xmm3, 0x240(%rbx)
00000000001cc983	movss	%xmm1, 0x244(%rbx)
00000000001cc98b	movss	%xmm2, 0x248(%rbx)
00000000001cc993	movss	0x6925f5(%rip), %xmm1
00000000001cc99b	mulss	%xmm0, %xmm1
00000000001cc99f	mulss	%xmm0, %xmm1
00000000001cc9a3	movsldup	-0x50(%rbp), %xmm2              ## xmm2 = mem[0,0,2,2]
00000000001cc9a8	movaps	0x6925c1(%rip), %xmm3
00000000001cc9af	insertps	$0x10, %xmm1, %xmm3             ## xmm3 = xmm3[0],xmm1[0],xmm3[2,3]
00000000001cc9b5	divps	%xmm3, %xmm2
00000000001cc9b8	movlps	%xmm2, 0x24c(%rbx)
00000000001cc9bf	mulss	%xmm0, %xmm0
00000000001cc9c3	movss	-0x38(%rbp), %xmm1
00000000001cc9c8	divss	%xmm0, %xmm1
00000000001cc9cc	movss	%xmm1, 0x254(%rbx)
00000000001cc9d4	movq	0x38(%rbp), %rax
00000000001cc9d8	movss	(%rax), %xmm0
00000000001cc9dc	movss	%xmm0, 0x258(%rbx)
00000000001cc9e4	movss	0x4(%rax), %xmm0
00000000001cc9e9	movss	%xmm0, 0x25c(%rbx)
00000000001cc9f1	movss	0x8(%rax), %xmm0
00000000001cc9f6	movss	%xmm0, 0x260(%rbx)
00000000001cc9fe	movss	0xc(%rax), %xmm0
00000000001cca03	movss	%xmm0, 0x264(%rbx)
00000000001cca0b	movss	0x10(%rax), %xmm0
00000000001cca10	movss	%xmm0, 0x268(%rbx)
00000000001cca18	movss	0x14(%rax), %xmm0
00000000001cca1d	movss	%xmm0, 0x26c(%rbx)
00000000001cca25	movss	0x18(%rax), %xmm0
00000000001cca2a	movss	%xmm0, 0x270(%rbx)
00000000001cca32	movss	0x1c(%rax), %xmm0
00000000001cca37	movss	%xmm0, 0x274(%rbx)
00000000001cca3f	movss	-0x3c(%rbp), %xmm0
00000000001cca44	cvtss2sd	%xmm0, %xmm0
00000000001cca48	divsd	0x204400(%rip), %xmm0
00000000001cca50	cvtsd2ss	%xmm0, %xmm0
00000000001cca54	shufps	$0xc0, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,0,3]
00000000001cca58	insertps	$0x30, 0x1fb25e(%rip), %xmm0    ## xmm0 = xmm0[0,1,2],mem[0]
00000000001cca62	movq	0x18(%rbp), %rax
00000000001cca66	movsd	0x4(%rax), %xmm1
00000000001cca6b	movss	(%rax), %xmm2
00000000001cca6f	shufps	$0x4c, %xmm1, %xmm2             ## xmm2 = xmm2[0,3],xmm1[0,1]
00000000001cca73	shufps	$0x78, %xmm2, %xmm2             ## xmm2 = xmm2[0,2,3,1]
00000000001cca77	mulps	%xmm0, %xmm2
00000000001cca7a	movaps	%xmm2, 0x280(%rbx)
00000000001cca81	movsd	0x10(%rax), %xmm1
00000000001cca86	movss	0xc(%rax), %xmm2
00000000001cca8b	shufps	$0x4c, %xmm1, %xmm2             ## xmm2 = xmm2[0,3],xmm1[0,1]
00000000001cca8f	shufps	$0x78, %xmm2, %xmm2             ## xmm2 = xmm2[0,2,3,1]
00000000001cca93	mulps	%xmm0, %xmm2
00000000001cca96	movaps	%xmm2, 0x290(%rbx)
00000000001cca9d	movsd	0x1c(%rax), %xmm1
00000000001ccaa2	movss	0x18(%rax), %xmm2
00000000001ccaa7	shufps	$0x4c, %xmm1, %xmm2             ## xmm2 = xmm2[0,3],xmm1[0,1]
00000000001ccaab	shufps	$0x78, %xmm2, %xmm2             ## xmm2 = xmm2[0,2,3,1]
00000000001ccaaf	mulps	%xmm0, %xmm2
00000000001ccab2	movaps	%xmm2, 0x2a0(%rbx)
00000000001ccab9	movaps	0x1fd520(%rip), %xmm0
00000000001ccac0	movaps	%xmm0, 0x2b0(%rbx)
00000000001ccac7	movq	0x28(%rbp), %rax
00000000001ccacb	movups	(%rax), %xmm0
00000000001ccace	movups	0x10(%rax), %xmm1
00000000001ccad2	movups	0x20(%rax), %xmm2
00000000001ccad6	movups	0x30(%rax), %xmm3
00000000001ccada	movups	%xmm0, 0x2c0(%rbx)
00000000001ccae1	movups	%xmm1, 0x2d0(%rbx)
00000000001ccae8	movups	%xmm2, 0x2e0(%rbx)
00000000001ccaef	movups	%xmm3, 0x2f0(%rbx)
00000000001ccaf6	movups	0x3e(%rax), %xmm0
00000000001ccafa	movups	%xmm0, 0x2fe(%rbx)
00000000001ccb01	movl	0x20(%rbp), %eax
00000000001ccb04	movl	%eax, 0x310(%rbx)
00000000001ccb0a	movl	$0x3, %eax
00000000001ccb0f	movl	0x40(%rbp), %ecx
00000000001ccb12	testl	%ecx, %ecx
00000000001ccb14	jne	0x1ccb19
00000000001ccb16	movl	0x30(%rbp), %eax
00000000001ccb19	movl	%eax, 0x314(%rbx)
00000000001ccb1f	movl	%ecx, 0x318(%rbx)
00000000001ccb25	movb	$0x1, %al
00000000001ccb27	addq	$0x28, %rsp
00000000001ccb2b	popq	%rbx
00000000001ccb2c	popq	%r12
00000000001ccb2e	popq	%r13
00000000001ccb30	popq	%r14
00000000001ccb32	popq	%r15
00000000001ccb34	popq	%rbp
00000000001ccb35	retq
00000000001ccb36	nopw	%cs:(%rax,%rax)
