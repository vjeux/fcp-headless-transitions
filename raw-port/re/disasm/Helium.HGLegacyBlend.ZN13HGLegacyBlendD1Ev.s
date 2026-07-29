__ZN13HGLegacyBlendD1Ev:
00000000002418b0	pushq	%rbp
00000000002418b1	movq	%rsp, %rbp
00000000002418b4	pushq	%rbx
00000000002418b5	pushq	%rax
00000000002418b6	movq	%rdi, %rbx
00000000002418b9	leaq	0x7f4a20(%rip), %rax
00000000002418c0	movq	%rax, (%rdi)
00000000002418c3	movq	0x1b8(%rdi), %rax
00000000002418ca	testq	%rax, %rax
00000000002418cd	je	0x2418dd
00000000002418cf	movq	-0x8(%rax), %rdi
00000000002418d3	testq	%rdi, %rdi
00000000002418d6	je	0x2418dd
00000000002418d8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000002418dd	movq	0x198(%rbx), %rdi
00000000002418e4	testq	%rdi, %rdi
00000000002418e7	je	0x2418ef
00000000002418e9	movq	(%rdi), %rax
00000000002418ec	callq	*0x18(%rax)
00000000002418ef	movq	%rbx, %rdi
00000000002418f2	addq	$0x8, %rsp
00000000002418f6	popq	%rbx
00000000002418f7	popq	%rbp
00000000002418f8	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002418fd	movq	%rax, %rdi
0000000000241900	callq	___clang_call_terminate
0000000000241905	nopw	%cs:(%rax,%rax)
