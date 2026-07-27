__ZN16LiImageTransformC1Ev:
00000000000a5710	pushq	%rbp
00000000000a5711	movq	%rsp, %rbp
00000000000a5714	pushq	%r15
00000000000a5716	pushq	%r14
00000000000a5718	pushq	%r12
00000000000a571a	pushq	%rbx
00000000000a571b	movq	%rdi, %rbx
00000000000a571e	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000000a5725	addq	$0x10, %rax
00000000000a5729	movq	%rax, 0x160(%rdi)
00000000000a5730	movq	$0x0, 0x168(%rdi)
00000000000a573b	movq	0x78026e(%rip), %r14            ## literal pool symbol address: __ZTT16LiImageTransform
00000000000a5742	leaq	0x10(%r14), %r12
00000000000a5746	movq	%r12, %rsi
00000000000a5749	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
00000000000a574e	movq	0x8(%r14), %rax
00000000000a5752	movq	0x30(%r14), %rcx
00000000000a5756	movq	%rax, (%rbx)
00000000000a5759	movq	-0x18(%rax), %rax
00000000000a575d	movq	%rcx, (%rbx,%rax)
00000000000a5761	movq	$0x0, 0x10(%rbx)
00000000000a5769	leaq	0x18(%rbx), %rdi
00000000000a576d	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000000a5772	movl	$0x0, 0x20(%rbx)
00000000000a5779	movq	0x780290(%rip), %rax            ## literal pool symbol address: __ZTV16LiImageTransform
00000000000a5780	leaq	0x18(%rax), %rcx
00000000000a5784	movq	%rcx, (%rbx)
00000000000a5787	addq	$0x100, %rax                    ## imm = 0x100
00000000000a578d	movq	%rax, 0x160(%rbx)
00000000000a5794	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000000a579e	movq	%rax, 0x78(%rbx)
00000000000a57a2	movq	%rax, 0x50(%rbx)
00000000000a57a6	movq	%rax, 0x28(%rbx)
00000000000a57aa	xorps	%xmm0, %xmm0
00000000000a57ad	movups	%xmm0, 0x30(%rbx)
00000000000a57b1	movups	%xmm0, 0x40(%rbx)
00000000000a57b5	movups	%xmm0, 0x58(%rbx)
00000000000a57b9	movups	%xmm0, 0x68(%rbx)
00000000000a57bd	movups	%xmm0, 0x80(%rbx)
00000000000a57c4	movups	%xmm0, 0x90(%rbx)
00000000000a57cb	movq	%rax, 0x120(%rbx)
00000000000a57d2	movq	%rax, 0xf8(%rbx)
00000000000a57d9	movq	%rax, 0xd0(%rbx)
00000000000a57e0	movaps	0x6615f9(%rip), %xmm1
00000000000a57e7	movups	%xmm1, 0xa0(%rbx)
00000000000a57ee	movups	%xmm0, 0xc0(%rbx)
00000000000a57f5	movups	%xmm0, 0xb0(%rbx)
00000000000a57fc	movups	%xmm0, 0xe8(%rbx)
00000000000a5803	movups	%xmm0, 0xd8(%rbx)
00000000000a580a	movups	%xmm0, 0x110(%rbx)
00000000000a5811	movups	%xmm0, 0x100(%rbx)
00000000000a5818	movb	$0x0, 0x128(%rbx)
00000000000a581f	leaq	0x130(%rbx), %rdi
00000000000a5826	callq	0x6df24c                        ## symbol stub for: __ZN9LiClipSetC1Ev
00000000000a582b	popq	%rbx
00000000000a582c	popq	%r12
00000000000a582e	popq	%r14
00000000000a5830	popq	%r15
00000000000a5832	popq	%rbp
00000000000a5833	retq
00000000000a5834	movq	%rax, %r15
00000000000a5837	addq	$0x8, %r14
00000000000a583b	movq	%rbx, %rdi
00000000000a583e	movq	%r14, %rsi
00000000000a5841	callq	__ZN13LiImageFilterD2Ev         ## LiImageFilter::~LiImageFilter()
00000000000a5846	jmp	0xa585b
00000000000a5848	movq	%rax, %r15
00000000000a584b	movq	%rbx, %rdi
00000000000a584e	movq	%r12, %rsi
00000000000a5851	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
00000000000a5856	jmp	0xa585b
00000000000a5858	movq	%rax, %r15
00000000000a585b	addq	$0x160, %rbx                    ## imm = 0x160
00000000000a5862	movq	%rbx, %rdi
00000000000a5865	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000000a586a	movq	%r15, %rdi
00000000000a586d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000a5872	nopw	%cs:(%rax,%rax)
