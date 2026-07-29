00000000000ba26c	pushq	%rbp
00000000000ba26d	movq	%rsp, %rbp
00000000000ba270	pushq	%r15
00000000000ba272	pushq	%r14
00000000000ba274	pushq	%rbx
00000000000ba275	pushq	%rax
00000000000ba276	movq	%rsi, %r14
00000000000ba279	movq	%rdi, %rbx
00000000000ba27c	movq	(%rsi), %rax
00000000000ba27f	callq	*0x18(%rax)
00000000000ba282	leaq	0x10(%r14), %r15
00000000000ba286	movq	%r15, %rdi
00000000000ba289	callq	__ZNK8PCString4sizeEv           ## PCString::size() const
00000000000ba28e	testl	%eax, %eax
00000000000ba290	je	0xba2c2
00000000000ba292	leaq	0x76ecb(%rip), %rsi             ## literal pool for: ": "
00000000000ba299	leaq	-0x20(%rbp), %rdi
00000000000ba29d	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000ba2a2	leaq	-0x20(%rbp), %rsi
00000000000ba2a6	movq	%rbx, %rdi
00000000000ba2a9	callq	__ZN8PCString6appendERKS_       ## PCString::append(PCString const&)
00000000000ba2ae	leaq	-0x20(%rbp), %rdi
00000000000ba2b2	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000ba2b7	movq	%rbx, %rdi
00000000000ba2ba	movq	%r15, %rsi
00000000000ba2bd	callq	__ZN8PCString6appendERKS_       ## PCString::append(PCString const&)
00000000000ba2c2	cmpl	$0x0, 0x20(%r14)
00000000000ba2c7	je	0xba32d
00000000000ba2c9	leaq	0x76e97(%rip), %rsi             ## literal pool for: " ("
00000000000ba2d0	movq	%rbx, %rdi
00000000000ba2d3	callq	__ZN8PCString6appendEPKc        ## PCString::append(char const*)
00000000000ba2d8	leaq	0x18(%r14), %rsi
00000000000ba2dc	movq	%rbx, %rdi
00000000000ba2df	callq	__ZN8PCString6appendERKS_       ## PCString::append(PCString const&)
00000000000ba2e4	leaq	0x76e7f(%rip), %rsi             ## literal pool for: ":"
00000000000ba2eb	movq	%rbx, %rdi
00000000000ba2ee	callq	__ZN8PCString6appendEPKc        ## PCString::append(char const*)
00000000000ba2f3	movl	0x20(%r14), %edx
00000000000ba2f7	leaq	0x76e6e(%rip), %rsi             ## literal pool for: "%d"
00000000000ba2fe	leaq	-0x20(%rbp), %rdi
00000000000ba302	xorl	%eax, %eax
00000000000ba304	callq	__ZN8PCString8ssprintfEPKcz     ## PCString::ssprintf(char const*, ...)
00000000000ba309	leaq	-0x20(%rbp), %rsi
00000000000ba30d	movq	%rbx, %rdi
00000000000ba310	callq	__ZN8PCString6appendERKS_       ## PCString::append(PCString const&)
00000000000ba315	leaq	-0x20(%rbp), %rdi
00000000000ba319	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000ba31e	leaq	0x76e4a(%rip), %rsi             ## literal pool for: ")"
00000000000ba325	movq	%rbx, %rdi
00000000000ba328	callq	__ZN8PCString6appendEPKc        ## PCString::append(char const*)
00000000000ba32d	movq	%rbx, %rax
00000000000ba330	addq	$0x8, %rsp
00000000000ba334	popq	%rbx
00000000000ba335	popq	%r14
00000000000ba337	popq	%r15
00000000000ba339	popq	%rbp
00000000000ba33a	retq
00000000000ba33b	jmp	0xba33f
00000000000ba33d	jmp	0xba34f
00000000000ba33f	movq	%rax, %r14
00000000000ba342	leaq	-0x20(%rbp), %rdi
00000000000ba346	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000ba34b	jmp	0xba352
00000000000ba34d	jmp	0xba34f
00000000000ba34f	movq	%rax, %r14
00000000000ba352	movq	%rbx, %rdi
00000000000ba355	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000ba35a	movq	%r14, %rdi
00000000000ba35d	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
