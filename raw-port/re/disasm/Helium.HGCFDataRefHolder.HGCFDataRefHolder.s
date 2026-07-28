__ZN17HGCFDataRefHolderC1EPK8__CFData:
0000000000007f30	pushq	%rbp
0000000000007f31	movq	%rsp, %rbp
0000000000007f34	pushq	%r14
0000000000007f36	pushq	%rbx
0000000000007f37	movq	%rsi, %r14
0000000000007f3a	movq	%rdi, %rbx
0000000000007f3d	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000007f42	leaq	0x9fb897(%rip), %rax
0000000000007f49	movq	%rax, (%rbx)
0000000000007f4c	movq	%r14, 0x10(%rbx)
0000000000007f50	movq	%r14, %rdi
0000000000007f53	callq	0x3c4b20                        ## symbol stub for: _CFRetain
0000000000007f58	popq	%rbx
0000000000007f59	popq	%r14
0000000000007f5b	popq	%rbp
0000000000007f5c	retq
0000000000007f5d	movq	%rax, %r14
0000000000007f60	movq	%rbx, %rdi
0000000000007f63	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000007f68	movq	%r14, %rdi
0000000000007f6b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
