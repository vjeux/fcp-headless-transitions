__ZN27HGAutoReleasePoolScopeGuardC1Ev:
000000000008f9f0	pushq	%rbp
000000000008f9f1	movq	%rsp, %rbp
000000000008f9f4	pushq	%rbx
000000000008f9f5	pushq	%rax
000000000008f9f6	movq	%rdi, %rbx
000000000008f9f9	movq	0x9cbcc8(%rip), %rdi            ## Objc class ref: _OBJC_CLASS_$_NSAutoreleasePool
000000000008fa00	callq	0x3c54b0                        ## symbol stub for: _objc_opt_new
000000000008fa05	movq	%rax, (%rbx)
000000000008fa08	addq	$0x8, %rsp
000000000008fa0c	popq	%rbx
000000000008fa0d	popq	%rbp
000000000008fa0e	retq
000000000008fa0f	nop
