__ZN16HGYUVPlanarTo444D0Ev:
00000000000e5480	pushq	%rbp
00000000000e5481	movq	%rsp, %rbp
00000000000e5484	pushq	%rbx
00000000000e5485	pushq	%rax
00000000000e5486	movq	%rdi, %rbx
00000000000e5489	leaq	0x928f88(%rip), %rax
00000000000e5490	movq	%rax, (%rdi)
00000000000e5493	movq	0x198(%rdi), %rdi
00000000000e549a	testq	%rdi, %rdi
00000000000e549d	je	0xe54a5
00000000000e549f	movq	(%rdi), %rax
00000000000e54a2	callq	*0x18(%rax)
00000000000e54a5	movq	%rbx, %rdi
00000000000e54a8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000e54ad	movq	%rbx, %rdi
00000000000e54b0	addq	$0x8, %rsp
00000000000e54b4	popq	%rbx
00000000000e54b5	popq	%rbp
00000000000e54b6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e54bb	movq	%rax, %rdi
00000000000e54be	callq	___clang_call_terminate
00000000000e54c3	nopw	%cs:(%rax,%rax)
