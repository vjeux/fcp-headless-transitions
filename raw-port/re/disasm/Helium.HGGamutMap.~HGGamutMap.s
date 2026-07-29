__ZN10HGGamutMapD0Ev:
0000000000157550	pushq	%rbp
0000000000157551	movq	%rsp, %rbp
0000000000157554	pushq	%rbx
0000000000157555	pushq	%rax
0000000000157556	movq	%rdi, %rbx
0000000000157559	leaq	0x8c89d0(%rip), %rax
0000000000157560	movq	%rax, (%rdi)
0000000000157563	movq	0x198(%rdi), %rdi
000000000015756a	callq	0x3c4b98                        ## symbol stub for: _CGColorSpaceRelease
000000000015756f	movq	0x1a0(%rbx), %rdi
0000000000157576	callq	0x3c4b98                        ## symbol stub for: _CGColorSpaceRelease
000000000015757b	movq	0x1c8(%rbx), %rdi
0000000000157582	testq	%rdi, %rdi
0000000000157585	je	0x15758d
0000000000157587	movq	(%rdi), %rax
000000000015758a	callq	*0x18(%rax)
000000000015758d	movq	%rbx, %rdi
0000000000157590	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157595	movq	%rbx, %rdi
0000000000157598	addq	$0x8, %rsp
000000000015759c	popq	%rbx
000000000015759d	popq	%rbp
000000000015759e	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001575a3	movq	%rax, %rdi
00000000001575a6	callq	___clang_call_terminate
00000000001575ab	movq	%rax, %rdi
00000000001575ae	callq	___clang_call_terminate
00000000001575b3	nopw	%cs:(%rax,%rax)
