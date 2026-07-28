__ZN23HGBilateralFilterInterp9GetOutputEP10HGRenderer:
0000000000109db0	pushq	%rbp
0000000000109db1	movq	%rsp, %rbp
0000000000109db4	pushq	%r14
0000000000109db6	pushq	%rbx
0000000000109db7	movq	%rdi, %rbx
0000000000109dba	movq	0x1b8(%rdi), %r14
0000000000109dc1	movq	%rsi, %rdi
0000000000109dc4	movq	%rbx, %rsi
0000000000109dc7	xorl	%edx, %edx
0000000000109dc9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000109dce	movq	(%r14), %rcx
0000000000109dd1	movq	%r14, %rdi
0000000000109dd4	xorl	%esi, %esi
0000000000109dd6	movq	%rax, %rdx
0000000000109dd9	callq	*0x78(%rcx)
0000000000109ddc	cmpb	$0x1, 0x1d4(%rbx)
0000000000109de3	jne	0x109ded
0000000000109de5	movq	%rbx, %rdi
0000000000109de8	callq	__ZN23HGBilateralFilterInterp10BuildGraphEv ## HGBilateralFilterInterp::BuildGraph()
0000000000109ded	movq	%rbx, %rdi
0000000000109df0	callq	__ZN23HGBilateralFilterInterp12UpdateParamsEv ## HGBilateralFilterInterp::UpdateParams()
0000000000109df5	movq	0x1c0(%rbx), %rax
0000000000109dfc	popq	%rbx
0000000000109dfd	popq	%r14
0000000000109dff	popq	%rbp
0000000000109e00	retq
0000000000109e01	nopw	%cs:(%rax,%rax)
