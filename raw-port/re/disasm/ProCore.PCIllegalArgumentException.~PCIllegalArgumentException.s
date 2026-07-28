__ZN26PCIllegalArgumentExceptionD0Ev:
000000000002bf70	pushq	%rbp
000000000002bf71	movq	%rsp, %rbp
000000000002bf74	pushq	%rbx
000000000002bf75	pushq	%rax
000000000002bf76	movq	%rdi, %rbx
000000000002bf79	callq	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
000000000002bf7e	movq	%rbx, %rdi
000000000002bf81	addq	$0x8, %rsp
000000000002bf85	popq	%rbx
000000000002bf86	popq	%rbp
000000000002bf87	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
