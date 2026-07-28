__ZN17HGCFDataRefHolderC2EPK8__CFData:
0000000000007ef0	pushq	%rbp
0000000000007ef1	movq	%rsp, %rbp
0000000000007ef4	pushq	%r14
0000000000007ef6	pushq	%rbx
0000000000007ef7	movq	%rsi, %r14
0000000000007efa	movq	%rdi, %rbx
0000000000007efd	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000007f02	leaq	0x9fb8d7(%rip), %rax
0000000000007f09	movq	%rax, (%rbx)
0000000000007f0c	movq	%r14, 0x10(%rbx)
0000000000007f10	movq	%r14, %rdi
0000000000007f13	callq	0x3c4b20                        ## symbol stub for: _CFRetain
0000000000007f18	popq	%rbx
0000000000007f19	popq	%r14
0000000000007f1b	popq	%rbp
0000000000007f1c	retq
0000000000007f1d	movq	%rax, %r14
0000000000007f20	movq	%rbx, %rdi
0000000000007f23	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000007f28	movq	%r14, %rdi
0000000000007f2b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
