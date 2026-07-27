__ZN25HMaskSimpleStrokeSubtract6GetROIEP10HGRendereri6HGRect:
0000000000425c70	movq	%rcx, %rax
0000000000425c73	cmpl	$0x2, %edx
0000000000425c76	jl	0x425c8b
0000000000425c78	pushq	%rbp
0000000000425c79	movq	%rsp, %rbp
0000000000425c7c	movq	0x3fb09d(%rip), %rcx            ## literal pool symbol address: _HGRectNull
0000000000425c83	movq	(%rcx), %rax
0000000000425c86	movq	0x8(%rcx), %r8
0000000000425c8a	popq	%rbp
0000000000425c8b	movq	%r8, %rdx
0000000000425c8e	retq
0000000000425c8f	addb	%dl, 0x48(%rbp)
0000000000425c92	movl	%esp, %ebp
0000000000425c94	pushq	%r15
0000000000425c96	pushq	%r14
0000000000425c98	pushq	%r13
0000000000425c9a	pushq	%r12
0000000000425c9c	pushq	%rbx
0000000000425c9d	pushq	%rax
0000000000425c9e	testq	%rdx, %rdx
0000000000425ca1	je	0x425da8
0000000000425ca7	movl	%ecx, %r13d
0000000000425caa	movq	%rdx, %rbx
0000000000425cad	movq	%rdi, %r14
0000000000425cb0	movl	%r8d, -0x30(%rbp)
0000000000425cb4	movq	0x3fca75(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000425cbb	leaq	__ZTI23OZ3DExtrusionProperties(%rip), %rdx ## typeinfo for OZ3DExtrusionProperties
0000000000425cc2	xorl	%r12d, %r12d
0000000000425cc5	movq	%rbx, %rdi
0000000000425cc8	xorl	%ecx, %ecx
0000000000425cca	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000425ccf	testq	%rax, %rax
0000000000425cd2	je	0x425dab
0000000000425cd8	movq	%rax, %r15
0000000000425cdb	movq	0x4e4796(%rip), %rsi
0000000000425ce2	movq	0x40033f(%rip), %r12            ## Objc message: -[%rdi greenComponent]
0000000000425ce9	movq	%r14, %rdi
0000000000425cec	callq	*%r12
0000000000425cef	movq	0x4e3ec2(%rip), %rsi
0000000000425cf6	movq	%rax, %rdi
0000000000425cf9	xorl	%edx, %edx
0000000000425cfb	callq	*%r12
0000000000425cfe	movq	0x4ebd9b(%rip), %rsi
0000000000425d05	movsbl	%r13b, %r13d
0000000000425d09	movsbl	-0x30(%rbp), %r12d
0000000000425d0e	movq	%rax, %rdi
0000000000425d11	movq	%r15, %rdx
0000000000425d14	movl	%r13d, %ecx
0000000000425d17	movl	%r12d, %r8d
0000000000425d1a	movl	$0x1, %r9d
0000000000425d20	callq	*0x400302(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000425d26	movq	%r14, %rdi
0000000000425d29	movq	0x4e4748(%rip), %rsi
0000000000425d30	movq	%r14, -0x30(%rbp)
0000000000425d34	movq	0x4002ed(%rip), %r14            ## Objc message: -[%rdi greenComponent]
0000000000425d3b	callq	*%r14
0000000000425d3e	movl	$0x1, %edx
0000000000425d43	movq	%rax, %rdi
0000000000425d46	movq	0x4e3e6b(%rip), %rsi
0000000000425d4d	callq	*%r14
0000000000425d50	movq	%rax, %rdi
0000000000425d53	movq	0x4ebd46(%rip), %rsi
0000000000425d5a	movq	%r15, %rdx
0000000000425d5d	movl	%r13d, %ecx
0000000000425d60	movl	%r12d, %r8d
0000000000425d63	xorl	%r9d, %r9d
0000000000425d66	callq	*%r14
0000000000425d69	testb	%r13b, %r13b
0000000000425d6c	je	0x425dbe
0000000000425d6e	movq	0x3fdc5b(%rip), %rax            ## literal pool symbol address: _OBJC_IVAR_$_OZViewController._pChanList
0000000000425d75	movq	(%rax), %rax
0000000000425d78	movq	-0x30(%rbp), %rcx
0000000000425d7c	movq	(%rcx,%rax), %r14
0000000000425d80	movl	$0x18, %edi
0000000000425d85	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000425d8a	movq	%rbx, 0x10(%rax)
0000000000425d8e	movq	%r14, 0x8(%rax)
0000000000425d92	movq	(%r14), %rcx
0000000000425d95	movq	%rcx, (%rax)
0000000000425d98	movq	%rax, 0x8(%rcx)
0000000000425d9c	movq	%rax, (%r14)
0000000000425d9f	incq	0x10(%r14)
0000000000425da3	movb	$0x1, %r12b
0000000000425da6	jmp	0x425dab
0000000000425da8	xorl	%r12d, %r12d
0000000000425dab	movzbl	%r12b, %eax
0000000000425daf	addq	$0x8, %rsp
0000000000425db3	popq	%rbx
0000000000425db4	popq	%r12
0000000000425db6	popq	%r13
0000000000425db8	popq	%r14
0000000000425dba	popq	%r15
0000000000425dbc	popq	%rbp
0000000000425dbd	retq
0000000000425dbe	movq	0x3fdc03(%rip), %rax            ## literal pool symbol address: _OBJC_IVAR_$_OZViewController._pChan
0000000000425dc5	movq	(%rax), %rax
0000000000425dc8	movq	-0x30(%rbp), %rcx
0000000000425dcc	movq	%rbx, (%rcx,%rax)
0000000000425dd0	movq	0x3fdbf9(%rip), %rax            ## literal pool symbol address: _OBJC_IVAR_$_OZViewController._pChanList
0000000000425dd7	movq	(%rax), %rax
0000000000425dda	movq	(%rcx,%rax), %rbx
0000000000425dde	movb	$0x1, %r12b
0000000000425de1	cmpq	$0x0, 0x10(%rbx)
0000000000425de6	je	0x425dab
0000000000425de8	movq	(%rbx), %rax
0000000000425deb	movq	0x8(%rbx), %rdi
0000000000425def	movq	0x8(%rax), %rax
0000000000425df3	movq	(%rdi), %rcx
0000000000425df6	movq	%rax, 0x8(%rcx)
0000000000425dfa	movq	%rcx, (%rax)
0000000000425dfd	movq	$0x0, 0x10(%rbx)
0000000000425e05	cmpq	%rbx, %rdi
0000000000425e08	je	0x425dab
0000000000425e0a	nopw	(%rax,%rax)
0000000000425e10	movq	0x8(%rdi), %r14
0000000000425e14	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000425e19	movq	%r14, %rdi
0000000000425e1c	cmpq	%rbx, %r14
0000000000425e1f	jne	0x425e10
0000000000425e21	jmp	0x425dab
0000000000425e23	addb	%al, (%rax)
0000000000425e25	addb	%al, (%rax)
0000000000425e27	addb	%al, (%rax)
0000000000425e29	addb	%al, (%rax)
0000000000425e2b	addb	%al, (%rax)
0000000000425e2d	addb	%al, (%rax)
0000000000425e2f	addb	%dl, 0x48(%rbp)
0000000000425e32	movl	%esp, %ebp
0000000000425e34	pushq	%r15
0000000000425e36	pushq	%r14
0000000000425e38	pushq	%r13
0000000000425e3a	pushq	%r12
0000000000425e3c	pushq	%rbx
0000000000425e3d	subq	$0x58, %rsp
0000000000425e41	movq	%rdx, -0x38(%rbp)
0000000000425e45	testq	%rdx, %rdx
0000000000425e48	je	0x4260c1
0000000000425e4e	leaq	_theApp(%rip), %rax
0000000000425e55	movq	(%rax), %rax
0000000000425e58	movq	0x20(%rax), %r14
0000000000425e5c	movq	0x8(%r14), %r13
0000000000425e60	addq	$0x10, %r14
0000000000425e64	cmpq	%r14, %r13
0000000000425e67	je	0x4260c1
0000000000425e6d	movq	0x4e7bac(%rip), %rax
0000000000425e74	movq	%rax, -0x70(%rbp)
0000000000425e78	movq	0x4e7ba9(%rip), %rax
0000000000425e7f	movq	%rax, -0x60(%rbp)
0000000000425e83	movq	0x4e7bae(%rip), %rax
0000000000425e8a	movq	%rax, -0x58(%rbp)
0000000000425e8e	movq	0x4e7b9b(%rip), %rax
0000000000425e95	movq	%rax, -0x68(%rbp)
0000000000425e99	movq	0x4ed038(%rip), %rax
0000000000425ea0	movq	%rax, -0x80(%rbp)
0000000000425ea4	movq	0x4ed05d(%rip), %rax
0000000000425eab	movq	%rax, -0x78(%rbp)
0000000000425eaf	jmp	0x425ecc
0000000000425eb1	nopw	%cs:(%rax,%rax)
0000000000425ec0	movq	%rax, %r13
0000000000425ec3	cmpq	%r14, %rax
0000000000425ec6	je	0x4260c1
0000000000425ecc	movq	0x30(%r13), %r12
0000000000425ed0	movaps	0x2df709(%rip), %xmm0
0000000000425ed7	movaps	%xmm0, -0x50(%rbp)
0000000000425edb	movq	%r12, %rdi
0000000000425ede	leaq	-0x50(%rbp), %rsi
0000000000425ee2	callq	0x6dfab6                        ## symbol stub for: __ZNK9OZFactory13isKindOfClassE6PCUUID
0000000000425ee7	testb	%al, %al
0000000000425ee9	je	0x426094
0000000000425eef	testb	$0x1, 0x28(%r12)
0000000000425ef5	jne	0x426094
0000000000425efb	movq	(%r12), %rax
0000000000425eff	leaq	-0x50(%rbp), %rdi
0000000000425f03	movq	%r12, %rsi
0000000000425f06	callq	*0x28(%rax)
0000000000425f09	movq	(%r12), %rax
0000000000425f0d	leaq	-0x40(%rbp), %rbx
0000000000425f11	movq	%rbx, %rdi
0000000000425f14	movq	%r12, %rsi
0000000000425f17	callq	*0x78(%rax)
0000000000425f1a	movq	%rbx, %rdi
0000000000425f1d	leaq	0x3a8832(%rip), %rsi            ## literal pool for: ".localized"
0000000000425f24	callq	0x6df05a                        ## symbol stub for: __ZN8PCString6appendEPKc
0000000000425f29	movq	%rbx, %rdi
0000000000425f2c	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
0000000000425f31	movq	-0x38(%rbp), %rbx
0000000000425f35	testb	%al, %al
0000000000425f37	jne	0x425fe5
0000000000425f3d	leaq	-0x40(%rbp), %rdi
0000000000425f41	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
0000000000425f46	movq	-0x38(%rbp), %rdi
0000000000425f4a	movq	-0x70(%rbp), %rsi
0000000000425f4e	movq	%rax, %rdx
0000000000425f51	xorl	%ecx, %ecx
0000000000425f53	xorl	%r8d, %r8d
0000000000425f56	callq	*0x4000cc(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000425f5c	movq	%rax, %rbx
0000000000425f5f	testq	%rax, %rax
0000000000425f62	jne	0x425fb3
0000000000425f64	leaq	_OBJC_CLASS_$_OZFileSystemLibEntry(%rip), %rdi
0000000000425f6b	callq	0x6dffa8                        ## symbol stub for: _objc_alloc
0000000000425f70	movq	%rax, %rbx
0000000000425f73	leaq	-0x40(%rbp), %rdi
0000000000425f77	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
0000000000425f7c	movq	%rbx, %rdi
0000000000425f7f	movq	-0x60(%rbp), %rsi
0000000000425f83	movq	-0x38(%rbp), %rdx
0000000000425f87	movq	%rax, %rcx
0000000000425f8a	movl	$0x200040, %r8d                 ## imm = 0x200040
0000000000425f90	callq	*0x400092(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000425f96	movq	%rax, %rbx
0000000000425f99	movq	-0x38(%rbp), %rdi
0000000000425f9d	movq	-0x58(%rbp), %rsi
0000000000425fa1	movq	%rax, %rdx
0000000000425fa4	callq	*0x40007e(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000425faa	movq	%rbx, %rdi
0000000000425fad	callq	*0x4000bd(%rip)                 ## literal pool symbol address: _objc_release
0000000000425fb3	movq	(%r12), %rax
0000000000425fb7	leaq	-0x30(%rbp), %r15
0000000000425fbb	movq	%r15, %rdi
0000000000425fbe	movq	%r12, %rsi
0000000000425fc1	callq	*0x70(%rax)
0000000000425fc4	movq	%r15, %rdi
0000000000425fc7	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
0000000000425fcc	movq	%rbx, %rdi
0000000000425fcf	movq	-0x68(%rbp), %rsi
0000000000425fd3	movq	%rax, %rdx
0000000000425fd6	callq	*0x40004c(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000425fdc	leaq	-0x30(%rbp), %rdi
0000000000425fe0	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000425fe5	leaq	_OBJC_CLASS_$_OZBehaviorLibEntry(%rip), %rdi
0000000000425fec	callq	0x6dffa8                        ## symbol stub for: _objc_alloc
0000000000425ff1	movq	%rax, %r15
0000000000425ff4	leaq	-0x50(%rbp), %rdi
0000000000425ff8	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
0000000000425ffd	movq	%r15, %rdi
0000000000426000	movq	-0x80(%rbp), %rsi
0000000000426004	movq	%rbx, %rdx
0000000000426007	movq	%rax, %rcx
000000000042600a	movq	%r12, %r8
000000000042600d	callq	*0x400015(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000426013	movq	%rax, %r15
0000000000426016	movq	%r12, %rdi
0000000000426019	movq	0x3fc858(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
0000000000426020	movq	0x400ec1(%rip), %rdx            ## literal pool symbol address: __ZTI17OZBehaviorFactory
0000000000426027	xorl	%ecx, %ecx
0000000000426029	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000042602e	testq	%rax, %rax
0000000000426031	je	0x426069
0000000000426033	movq	(%rax), %rcx
0000000000426036	leaq	-0x30(%rbp), %r12
000000000042603a	movq	%r12, %rdi
000000000042603d	movq	%rax, %rsi
0000000000426040	callq	*0xc0(%rcx)
0000000000426046	movq	%r12, %rdi
0000000000426049	callq	0x6dfa44                        ## symbol stub for: __ZNK8PCString6ns_strEv
000000000042604e	movq	%r15, %rdi
0000000000426051	movq	-0x78(%rbp), %rsi
0000000000426055	movq	%rax, %rdx
0000000000426058	xorl	%ecx, %ecx
000000000042605a	callq	*0x3fffc8(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000426060	leaq	-0x30(%rbp), %rdi
0000000000426064	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000426069	movq	%rbx, %rdi
000000000042606c	movq	-0x58(%rbp), %rsi
0000000000426070	movq	%r15, %rdx
0000000000426073	callq	*0x3fffaf(%rip)                 ## Objc message: -[%rdi greenComponent]
0000000000426079	movq	%r15, %rdi
000000000042607c	callq	*0x3fffee(%rip)                 ## literal pool symbol address: _objc_release
0000000000426082	leaq	-0x40(%rbp), %rdi
0000000000426086	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000042608b	leaq	-0x50(%rbp), %rdi
000000000042608f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000426094	movq	0x8(%r13), %rcx
0000000000426098	testq	%rcx, %rcx
000000000042609b	je	0x4260b0
000000000042609d	nopl	(%rax)
00000000004260a0	movq	%rcx, %rax
00000000004260a3	movq	(%rcx), %rcx
00000000004260a6	testq	%rcx, %rcx
00000000004260a9	jne	0x4260a0
00000000004260ab	jmp	0x425ec0
00000000004260b0	movq	0x10(%r13), %rax
00000000004260b4	cmpq	(%rax), %r13
00000000004260b7	movq	%rax, %r13
00000000004260ba	jne	0x4260b0
00000000004260bc	jmp	0x425ec0
00000000004260c1	addq	$0x58, %rsp
00000000004260c5	popq	%rbx
00000000004260c6	popq	%r12
00000000004260c8	popq	%r13
00000000004260ca	popq	%r14
00000000004260cc	popq	%r15
00000000004260ce	popq	%rbp
00000000004260cf	retq
00000000004260d0	jmp	0x4260fe
00000000004260d2	jmp	0x4260fe
00000000004260d4	movq	%rax, %rbx
00000000004260d7	leaq	-0x50(%rbp), %rdi
00000000004260db	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004260e0	movq	%rbx, %rdi
00000000004260e3	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004260e8	jmp	0x4260ea
00000000004260ea	movq	%rax, %rbx
00000000004260ed	leaq	-0x30(%rbp), %rdi
00000000004260f1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004260f6	jmp	0x426101
00000000004260f8	jmp	0x4260fe
00000000004260fa	jmp	0x4260fe
00000000004260fc	jmp	0x4260fe
00000000004260fe	movq	%rax, %rbx
0000000000426101	leaq	-0x40(%rbp), %rdi
0000000000426105	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000042610a	leaq	-0x50(%rbp), %rdi
000000000042610e	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000426113	movq	%rbx, %rdi
0000000000426116	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000042611b	nopl	(%rax,%rax)
