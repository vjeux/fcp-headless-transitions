__ZN12PCArray_base8badIndexEv:
00000000000c4cd0	pushq	%rbp
00000000000c4cd1	movq	%rsp, %rbp
00000000000c4cd4	pushq	%r14
00000000000c4cd6	pushq	%rbx
00000000000c4cd7	subq	$0x10, %rsp
00000000000c4cdb	movl	$0x40, %edi
00000000000c4ce0	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000c4ce5	movq	%rax, %rbx
00000000000c4ce8	leaq	0x711eb(%rip), %rsi             ## literal pool for: "PCArray::operator[]"
00000000000c4cef	leaq	-0x18(%rbp), %rdi
00000000000c4cf3	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
00000000000c4cf8	leaq	-0x18(%rbp), %rsi
00000000000c4cfc	movq	%rbx, %rdi
00000000000c4cff	callq	__ZN11PCExceptionC2ERK8PCString ## PCException::PCException(PCString const&)
00000000000c4d04	leaq	0x87bc5(%rip), %rax
00000000000c4d0b	movq	%rax, (%rbx)
00000000000c4d0e	leaq	__ZTI19PCBadIndexException(%rip), %rsi ## typeinfo for PCBadIndexException
00000000000c4d15	leaq	__ZN19PCBadIndexExceptionD1Ev(%rip), %rdx ## PCBadIndexException::~PCBadIndexException()
00000000000c4d1c	movq	%rbx, %rdi
00000000000c4d1f	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000c4d24	ud2
00000000000c4d26	movq	%rax, %r14
00000000000c4d29	leaq	-0x18(%rbp), %rdi
00000000000c4d2d	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000c4d32	jmp	0xc4d4d
00000000000c4d34	movq	%rax, %r14
00000000000c4d37	leaq	-0x18(%rbp), %rdi
00000000000c4d3b	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000c4d40	jmp	0xc4d45
00000000000c4d42	movq	%rax, %r14
00000000000c4d45	movq	%rbx, %rdi
00000000000c4d48	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000c4d4d	movq	%r14, %rdi
00000000000c4d50	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000c4d55	nop
__ZN19PCBadIndexExceptionD1Ev:
00000000000c4d56	pushq	%rbp
00000000000c4d57	movq	%rsp, %rbp
00000000000c4d5a	popq	%rbp
00000000000c4d5b	jmp	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
__ZN19PCBadIndexExceptionD0Ev:
00000000000c4d60	pushq	%rbp
00000000000c4d61	movq	%rsp, %rbp
00000000000c4d64	pushq	%rbx
00000000000c4d65	pushq	%rax
00000000000c4d66	movq	%rdi, %rbx
00000000000c4d69	callq	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
00000000000c4d6e	movq	%rbx, %rdi
00000000000c4d71	addq	$0x8, %rsp
00000000000c4d75	popq	%rbx
00000000000c4d76	popq	%rbp
00000000000c4d77	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
__ZNK19PCBadIndexException9classNameEv:
00000000000c4d7c	pushq	%rbp
00000000000c4d7d	movq	%rsp, %rbp
00000000000c4d80	pushq	%rbx
00000000000c4d81	pushq	%rax
00000000000c4d82	movq	%rdi, %rbx
00000000000c4d85	leaq	0x8b5cc(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
