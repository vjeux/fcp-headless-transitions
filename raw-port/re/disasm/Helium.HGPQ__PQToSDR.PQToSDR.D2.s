__ZN4HGPQ7PQToSDRD2Ev:
00000000000ff000	pushq	%rbp
00000000000ff001	movq	%rsp, %rbp
00000000000ff004	pushq	%rbx
00000000000ff005	pushq	%rax
00000000000ff006	movq	%rdi, %rbx
00000000000ff009	leaq	0x917a70(%rip), %rax
00000000000ff010	movq	%rax, (%rdi)
00000000000ff013	movq	0x198(%rdi), %rdi
00000000000ff01a	testq	%rdi, %rdi
00000000000ff01d	je	0xff025
00000000000ff01f	movq	(%rdi), %rax
00000000000ff022	callq	*0x18(%rax)
00000000000ff025	movq	0x1c0(%rbx), %rdi
00000000000ff02c	testq	%rdi, %rdi
00000000000ff02f	je	0xff037
00000000000ff031	movq	(%rdi), %rax
00000000000ff034	callq	*0x18(%rax)
00000000000ff037	movq	0x1c8(%rbx), %rdi
00000000000ff03e	testq	%rdi, %rdi
00000000000ff041	je	0xff049
00000000000ff043	movq	(%rdi), %rax
00000000000ff046	callq	*0x18(%rax)
00000000000ff049	movq	%rbx, %rdi
00000000000ff04c	addq	$0x8, %rsp
00000000000ff050	popq	%rbx
00000000000ff051	popq	%rbp
00000000000ff052	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000ff057	movq	%rax, %rdi
00000000000ff05a	callq	___clang_call_terminate
00000000000ff05f	nop
