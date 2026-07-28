__ZN9HGLensGDC13SetParametersEffRKN14HGColorConform13GDCParametersE:
00000000001e2ff0	pushq	%rbp
00000000001e2ff1	movq	%rsp, %rbp
00000000001e2ff4	pushq	%r14
00000000001e2ff6	pushq	%rbx
00000000001e2ff7	subq	$0x10, %rsp
00000000001e2ffb	movq	%rsi, %rbx
00000000001e2ffe	movaps	%xmm0, %xmm2
00000000001e3001	movq	%rdi, %r14
00000000001e3004	insertps	$0x10, %xmm1, %xmm2             ## xmm2 = xmm2[0],xmm1[0],xmm2[2,3]
00000000001e300a	addps	0x1e794f(%rip), %xmm2
00000000001e3011	movsd	(%rsi), %xmm0
00000000001e3015	mulps	%xmm2, %xmm0
00000000001e3018	xorps	%xmm3, %xmm3
00000000001e301b	addps	%xmm0, %xmm3
00000000001e301e	movaps	0x1e4c0b(%rip), %xmm1
00000000001e3025	movaps	%xmm3, %xmm0
00000000001e3028	andps	%xmm1, %xmm0
00000000001e302b	subps	%xmm3, %xmm2
00000000001e302e	movaps	%xmm3, %xmm5
00000000001e3031	movaps	%xmm3, -0x20(%rbp)
00000000001e3035	movshdup	%xmm2, %xmm4                    ## xmm4 = xmm2[1,1,3,3]
00000000001e3039	andps	%xmm1, %xmm2
00000000001e303c	movaps	%xmm2, %xmm3
00000000001e303f	maxss	%xmm0, %xmm3
00000000001e3043	cmpunordss	%xmm0, %xmm0
00000000001e3048	blendvps	%xmm0, %xmm2, %xmm3
00000000001e304d	movshdup	%xmm5, %xmm0                    ## xmm0 = xmm5[1,1,3,3]
00000000001e3051	andps	%xmm1, %xmm0
00000000001e3054	andps	%xmm1, %xmm4
00000000001e3057	movaps	%xmm4, %xmm1
00000000001e305a	maxss	%xmm0, %xmm1
00000000001e305e	cmpunordss	%xmm0, %xmm0
00000000001e3063	blendvps	%xmm0, %xmm4, %xmm1
00000000001e3068	movaps	%xmm3, %xmm0
00000000001e306b	callq	0x3c53cc                        ## symbol stub for: _hypotf
00000000001e3070	movaps	-0x20(%rbp), %xmm1
00000000001e3074	movlps	%xmm1, 0x19c(%r14)
00000000001e307c	movss	0x1e4c3c(%rip), %xmm1
00000000001e3084	divss	%xmm0, %xmm1
00000000001e3088	movss	%xmm1, 0x1a4(%r14)
00000000001e3091	movss	0x8(%rbx), %xmm0
00000000001e3096	movss	%xmm0, 0x1a8(%r14)
00000000001e309f	movss	0xc(%rbx), %xmm0
00000000001e30a4	movss	%xmm0, 0x1ac(%r14)
00000000001e30ad	movss	0x10(%rbx), %xmm0
00000000001e30b2	movss	%xmm0, 0x1b0(%r14)
00000000001e30bb	movss	0x14(%rbx), %xmm0
00000000001e30c0	movss	%xmm0, 0x1b4(%r14)
00000000001e30c9	movss	0x18(%rbx), %xmm0
00000000001e30ce	movss	%xmm0, 0x1b8(%r14)
00000000001e30d7	movss	0x1c(%rbx), %xmm0
00000000001e30dc	movss	%xmm0, 0x1bc(%r14)
00000000001e30e5	movss	0x20(%rbx), %xmm0
00000000001e30ea	movss	%xmm0, 0x1c0(%r14)
00000000001e30f3	movss	0x24(%rbx), %xmm0
00000000001e30f8	movss	%xmm0, 0x1c4(%r14)
00000000001e3101	movss	0x28(%rbx), %xmm0
00000000001e3106	movss	%xmm0, 0x1c8(%r14)
00000000001e310f	movss	0x2c(%rbx), %xmm0
00000000001e3114	movss	%xmm0, 0x1cc(%r14)
00000000001e311d	movss	0x30(%rbx), %xmm0
00000000001e3122	movss	%xmm0, 0x1d0(%r14)
00000000001e312b	movss	0x34(%rbx), %xmm0
00000000001e3130	movss	%xmm0, 0x1d4(%r14)
00000000001e3139	movss	0x38(%rbx), %xmm0
00000000001e313e	movss	%xmm0, 0x1d8(%r14)
00000000001e3147	movss	0x3c(%rbx), %xmm0
00000000001e314c	movss	%xmm0, 0x1dc(%r14)
00000000001e3155	movss	0x40(%rbx), %xmm0
00000000001e315a	movss	%xmm0, 0x1e0(%r14)
00000000001e3163	movsd	0x44(%rbx), %xmm0
00000000001e3168	movsd	%xmm0, 0x1e4(%r14)
00000000001e3171	movzbl	0x4c(%rbx), %eax
00000000001e3175	movb	%al, 0x1ec(%r14)
00000000001e317c	addq	$0x10, %rsp
00000000001e3180	popq	%rbx
00000000001e3181	popq	%r14
00000000001e3183	popq	%rbp
00000000001e3184	retq
00000000001e3185	nopw	%cs:(%rax,%rax)
