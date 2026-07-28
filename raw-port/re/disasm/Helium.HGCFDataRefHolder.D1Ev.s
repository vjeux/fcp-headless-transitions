__ZN17HGCFDataRefHolderD1Ev:
0000000000007fb0	pushq	%rbp
0000000000007fb1	movq	%rsp, %rbp
0000000000007fb4	pushq	%rbx
0000000000007fb5	pushq	%rax
0000000000007fb6	movq	%rdi, %rbx
0000000000007fb9	leaq	0x9fb820(%rip), %rax
0000000000007fc0	movq	%rax, (%rdi)
0000000000007fc3	movq	0x10(%rdi), %rdi
0000000000007fc7	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
0000000000007fcc	movq	%rbx, %rdi
0000000000007fcf	addq	$0x8, %rsp
0000000000007fd3	popq	%rbx
0000000000007fd4	popq	%rbp
0000000000007fd5	jmp	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000007fda	movq	%rax, %rdi
0000000000007fdd	callq	___clang_call_terminate
0000000000007fe2	nopw	%cs:(%rax,%rax)
