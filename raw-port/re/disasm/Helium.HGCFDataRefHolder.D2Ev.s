__ZN17HGCFDataRefHolderD2Ev:
0000000000007f70	pushq	%rbp
0000000000007f71	movq	%rsp, %rbp
0000000000007f74	pushq	%rbx
0000000000007f75	pushq	%rax
0000000000007f76	movq	%rdi, %rbx
0000000000007f79	leaq	0x9fb860(%rip), %rax
0000000000007f80	movq	%rax, (%rdi)
0000000000007f83	movq	0x10(%rdi), %rdi
0000000000007f87	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
0000000000007f8c	movq	%rbx, %rdi
0000000000007f8f	addq	$0x8, %rsp
0000000000007f93	popq	%rbx
0000000000007f94	popq	%rbp
0000000000007f95	jmp	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000007f9a	movq	%rax, %rdi
0000000000007f9d	callq	___clang_call_terminate
0000000000007fa2	nopw	%cs:(%rax,%rax)
