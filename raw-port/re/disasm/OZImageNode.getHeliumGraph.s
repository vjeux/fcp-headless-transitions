__ZN11OZImageNode14getHeliumGraphERK14OZRenderParamsP10HGRendererR18FxColorDescriptionP14PCMatrix44TmplIdE:
00000000001a3be0	pushq	%rbp
00000000001a3be1	movq	%rsp, %rbp
00000000001a3be4	pushq	%r15
00000000001a3be6	pushq	%r14
00000000001a3be8	pushq	%rbx
00000000001a3be9	subq	$0x18, %rsp
00000000001a3bed	movl	$0x40, %edi
00000000001a3bf2	callq	0x6dfcc0                        ## symbol stub for: ___cxa_allocate_exception
00000000001a3bf7	movq	%rax, %rbx
00000000001a3bfa	leaq	0x62a21c(%rip), %rsi            ## literal pool for: "subclass must implement"
00000000001a3c01	leaq	-0x20(%rbp), %rdi
00000000001a3c05	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000001a3c0a	leaq	0x62a224(%rip), %rsi            ## literal pool for: "/Library/Caches/com.apple.xbs/Sources/MotionSharedCode/Motion-45000.0.157/Ozone/CompositorObject/OZImageNode.cpp"
00000000001a3c11	leaq	-0x28(%rbp), %rdi
00000000001a3c15	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000001a3c1a	movq	0x67fb4f(%rip), %rax            ## literal pool symbol address: __ZTV11PCException
00000000001a3c21	addq	$0x10, %rax
00000000001a3c25	movq	%rax, (%rbx)
00000000001a3c28	movq	$0x0, 0x8(%rbx)
00000000001a3c30	leaq	0x10(%rbx), %r15
00000000001a3c34	leaq	-0x20(%rbp), %rsi
00000000001a3c38	movq	%r15, %rdi
00000000001a3c3b	callq	0x6df0ba                        ## symbol stub for: __ZN8PCStringC1ERKS_
00000000001a3c40	leaq	0x18(%rbx), %rdi
00000000001a3c44	leaq	-0x28(%rbp), %rsi
00000000001a3c48	callq	0x6df0ba                        ## symbol stub for: __ZN8PCStringC1ERKS_
00000000001a3c4d	movl	$0x31, 0x20(%rbx)
00000000001a3c54	xorps	%xmm0, %xmm0
00000000001a3c57	movups	%xmm0, 0x28(%rbx)
00000000001a3c5b	movq	$0x0, 0x38(%rbx)
00000000001a3c63	leaq	__ZTV31PCUnsupportedOperationException(%rip), %rax ## vtable for PCUnsupportedOperationException
00000000001a3c6a	addq	$0x10, %rax
00000000001a3c6e	movq	%rax, (%rbx)
00000000001a3c71	movq	0x6833d8(%rip), %rsi            ## literal pool symbol address: __ZTI31PCUnsupportedOperationException
00000000001a3c78	leaq	__ZN31PCUnsupportedOperationExceptionD1Ev(%rip), %rdx ## PCUnsupportedOperationException::~PCUnsupportedOperationException()
00000000001a3c7f	movq	%rbx, %rdi
00000000001a3c82	callq	0x6dfd08                        ## symbol stub for: ___cxa_throw
00000000001a3c87	ud2
00000000001a3c89	movq	%rax, %r14
00000000001a3c8c	xorl	%r15d, %r15d
00000000001a3c8f	jmp	0x1a3cb8
00000000001a3c91	movq	%rax, %r14
00000000001a3c94	movq	%r15, %rdi
00000000001a3c97	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000001a3c9c	jmp	0x1a3ca1
00000000001a3c9e	movq	%rax, %r14
00000000001a3ca1	movq	%rbx, %rdi
00000000001a3ca4	addq	$0x8, %rdi
00000000001a3ca8	callq	__ZN7PCCFRefIPK9__CFArrayED1Ev  ## PCCFRef<__CFArray const*>::~PCCFRef()
00000000001a3cad	movq	%rbx, %rdi
00000000001a3cb0	callq	0x6dfc24                        ## symbol stub for: __ZNSt9exceptionD2Ev
00000000001a3cb5	movb	$0x1, %r15b
00000000001a3cb8	leaq	-0x28(%rbp), %rdi
00000000001a3cbc	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000001a3cc1	leaq	-0x20(%rbp), %rdi
00000000001a3cc5	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000001a3cca	testb	%r15b, %r15b
00000000001a3ccd	jne	0x1a3ce3
00000000001a3ccf	movq	%r14, %rdi
00000000001a3cd2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a3cd7	movq	%rax, %r14
00000000001a3cda	leaq	-0x20(%rbp), %rdi
00000000001a3cde	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000001a3ce3	movq	%rbx, %rdi
00000000001a3ce6	callq	0x6dfce4                        ## symbol stub for: ___cxa_free_exception
00000000001a3ceb	movq	%r14, %rdi
00000000001a3cee	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a3cf3	movq	%rax, %r14
00000000001a3cf6	movq	%rbx, %rdi
00000000001a3cf9	callq	0x6dfce4                        ## symbol stub for: ___cxa_free_exception
00000000001a3cfe	movq	%r14, %rdi
00000000001a3d01	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a3d06	nopw	%cs:(%rax,%rax)
