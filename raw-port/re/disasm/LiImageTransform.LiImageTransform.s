__ZN16LiImageTransformC1EP13LiImageSource:
00000000000a4d10	pushq	%rbp
00000000000a4d11	movq	%rsp, %rbp
00000000000a4d14	pushq	%r15
00000000000a4d16	pushq	%r14
00000000000a4d18	pushq	%r12
00000000000a4d1a	pushq	%rbx
00000000000a4d1b	movq	%rsi, %r15
00000000000a4d1e	movq	%rdi, %rbx
00000000000a4d21	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000000a4d28	addq	$0x10, %rax
00000000000a4d2c	movq	%rax, 0x160(%rdi)
00000000000a4d33	movq	$0x0, 0x168(%rdi)
00000000000a4d3e	movq	0x780c6b(%rip), %r14            ## literal pool symbol address: __ZTT16LiImageTransform
00000000000a4d45	leaq	0x10(%r14), %r12
00000000000a4d49	movq	%r12, %rsi
00000000000a4d4c	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
00000000000a4d51	movq	0x8(%r14), %rax
00000000000a4d55	movq	0x30(%r14), %rcx
00000000000a4d59	movq	%rax, (%rbx)
00000000000a4d5c	movq	-0x18(%rax), %rax
00000000000a4d60	movq	%rcx, (%rbx,%rax)
00000000000a4d64	movq	$0x0, 0x10(%rbx)
00000000000a4d6c	leaq	0x18(%rbx), %rdi
00000000000a4d70	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000000a4d75	movl	$0x0, 0x20(%rbx)
00000000000a4d7c	movq	0x780c8d(%rip), %rax            ## literal pool symbol address: __ZTV16LiImageTransform
00000000000a4d83	leaq	0x18(%rax), %rcx
00000000000a4d87	movq	%rcx, (%rbx)
00000000000a4d8a	addq	$0x100, %rax                    ## imm = 0x100
00000000000a4d90	movq	%rax, 0x160(%rbx)
00000000000a4d97	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000000a4da1	movq	%rax, 0x78(%rbx)
00000000000a4da5	movq	%rax, 0x50(%rbx)
00000000000a4da9	movq	%rax, 0x28(%rbx)
00000000000a4dad	xorps	%xmm0, %xmm0
00000000000a4db0	movups	%xmm0, 0x30(%rbx)
00000000000a4db4	movups	%xmm0, 0x40(%rbx)
00000000000a4db8	movups	%xmm0, 0x58(%rbx)
00000000000a4dbc	movups	%xmm0, 0x68(%rbx)
00000000000a4dc0	movups	%xmm0, 0x80(%rbx)
00000000000a4dc7	movups	%xmm0, 0x90(%rbx)
00000000000a4dce	movq	%rax, 0x120(%rbx)
00000000000a4dd5	movq	%rax, 0xf8(%rbx)
00000000000a4ddc	movq	%rax, 0xd0(%rbx)
00000000000a4de3	movaps	0x661ff6(%rip), %xmm1
00000000000a4dea	movups	%xmm1, 0xa0(%rbx)
00000000000a4df1	movups	%xmm0, 0xc0(%rbx)
00000000000a4df8	movups	%xmm0, 0xb0(%rbx)
00000000000a4dff	movups	%xmm0, 0xe8(%rbx)
00000000000a4e06	movups	%xmm0, 0xd8(%rbx)
00000000000a4e0d	movups	%xmm0, 0x110(%rbx)
00000000000a4e14	movups	%xmm0, 0x100(%rbx)
00000000000a4e1b	leaq	0x130(%rbx), %r12
00000000000a4e22	movq	%r12, %rdi
00000000000a4e25	callq	0x6df24c                        ## symbol stub for: __ZN9LiClipSetC1Ev
00000000000a4e2a	movq	(%rbx), %rax
00000000000a4e2d	movq	%rbx, %rdi
00000000000a4e30	movq	%r15, %rsi
00000000000a4e33	callq	*0xa8(%rax)
00000000000a4e39	popq	%rbx
00000000000a4e3a	popq	%r12
00000000000a4e3c	popq	%r14
00000000000a4e3e	popq	%r15
00000000000a4e40	popq	%rbp
00000000000a4e41	retq
00000000000a4e42	movq	%rax, %r15
00000000000a4e45	movq	%r12, %rdi
00000000000a4e48	callq	__ZN9LiClipSetD2Ev              ## LiClipSet::~LiClipSet()
00000000000a4e4d	jmp	0xa4e52
00000000000a4e4f	movq	%rax, %r15
00000000000a4e52	addq	$0x8, %r14
00000000000a4e56	movq	%rbx, %rdi
00000000000a4e59	movq	%r14, %rsi
00000000000a4e5c	callq	__ZN13LiImageFilterD2Ev         ## LiImageFilter::~LiImageFilter()
00000000000a4e61	jmp	0xa4e76
00000000000a4e63	movq	%rax, %r15
00000000000a4e66	movq	%rbx, %rdi
00000000000a4e69	movq	%r12, %rsi
00000000000a4e6c	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
00000000000a4e71	jmp	0xa4e76
00000000000a4e73	movq	%rax, %r15
00000000000a4e76	addq	$0x160, %rbx                    ## imm = 0x160
00000000000a4e7d	movq	%rbx, %rdi
00000000000a4e80	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000000a4e85	movq	%r15, %rdi
00000000000a4e88	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a4e8d	nopl	(%rax)
