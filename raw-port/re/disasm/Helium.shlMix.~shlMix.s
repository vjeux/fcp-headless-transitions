__ZN6shlMixD0Ev:
000000000014e050	pushq	%rbp
000000000014e051	movq	%rsp, %rbp
000000000014e054	pushq	%rbx
000000000014e055	pushq	%rax
000000000014e056	movq	%rdi, %rbx
000000000014e059	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000014e05e	movq	%rbx, %rdi
000000000014e061	addq	$0x8, %rsp
000000000014e065	popq	%rbx
000000000014e066	popq	%rbp
000000000014e067	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000014e06c	nopl	(%rax)
