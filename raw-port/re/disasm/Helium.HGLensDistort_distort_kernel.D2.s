__ZN28HGLensDistort_distort_kernelD2Ev:
000000000022b750	leaq	0x8079e1(%rip), %rax
000000000022b757	movq	%rax, (%rdi)
000000000022b75a	movq	0x1f0(%rdi), %rax
000000000022b761	testq	%rax, %rax
000000000022b764	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000022b76a	movq	-0x8(%rax), %rax
000000000022b76e	testq	%rax, %rax
000000000022b771	je	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000022b777	pushq	%rbp
000000000022b778	movq	%rsp, %rbp
000000000022b77b	pushq	%rbx
000000000022b77c	pushq	%rax
000000000022b77d	movq	%rdi, %rbx
000000000022b780	movq	%rax, %rdi
000000000022b783	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000022b788	movq	%rbx, %rdi
000000000022b78b	addq	$0x8, %rsp
000000000022b78f	popq	%rbx
000000000022b790	popq	%rbp
000000000022b791	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000022b796	nopw	%cs:(%rax,%rax)
