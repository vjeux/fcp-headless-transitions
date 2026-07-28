__ZN17HGParamBufferDescD0Ev:
00000000002ddbd0	pushq	%rbp
00000000002ddbd1	movq	%rsp, %rbp
00000000002ddbd4	pushq	%r15
00000000002ddbd6	pushq	%r14
00000000002ddbd8	pushq	%rbx
00000000002ddbd9	pushq	%rax
00000000002ddbda	movq	%rdi, %rbx
00000000002ddbdd	leaq	__ZTV17HGParamBufferDesc(%rip), %rax ## vtable for HGParamBufferDesc
00000000002ddbe4	addq	$0x10, %rax
00000000002ddbe8	movq	%rax, (%rdi)
00000000002ddbeb	movq	0x10(%rdi), %r14
00000000002ddbef	testq	%r14, %r14
00000000002ddbf2	je	0x2ddc37
00000000002ddbf4	movq	0x18(%rbx), %r15
00000000002ddbf8	movq	%r14, %rdi
00000000002ddbfb	cmpq	%r15, %r14
00000000002ddbfe	jne	0x2ddc19
00000000002ddc00	jmp	0x2ddc2e
00000000002ddc02	nopw	%cs:(%rax,%rax)
00000000002ddc10	addq	$-0x8, %r15
00000000002ddc14	cmpq	%r14, %r15
00000000002ddc17	je	0x2ddc2a
00000000002ddc19	movq	-0x8(%r15), %rdi
00000000002ddc1d	testq	%rdi, %rdi
00000000002ddc20	je	0x2ddc10
00000000002ddc22	movq	(%rdi), %rax
00000000002ddc25	callq	*0x18(%rax)
00000000002ddc28	jmp	0x2ddc10
00000000002ddc2a	movq	0x10(%rbx), %rdi
00000000002ddc2e	movq	%r14, 0x18(%rbx)
00000000002ddc32	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002ddc37	movq	%rbx, %rdi
00000000002ddc3a	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
00000000002ddc3f	movq	%rbx, %rdi
00000000002ddc42	addq	$0x8, %rsp
00000000002ddc46	popq	%rbx
00000000002ddc47	popq	%r14
00000000002ddc49	popq	%r15
00000000002ddc4b	popq	%rbp
00000000002ddc4c	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000002ddc51	movq	%rax, %rdi
00000000002ddc54	callq	___clang_call_terminate
00000000002ddc59	nopl	(%rax)
