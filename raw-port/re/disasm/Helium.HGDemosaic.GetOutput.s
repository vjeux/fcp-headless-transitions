__ZN10HGDemosaic9GetOutputEP10HGRenderer:
00000000000ddb80	pushq	%rbp
00000000000ddb81	movq	%rsp, %rbp
00000000000ddb84	pushq	%r14
00000000000ddb86	pushq	%rbx
00000000000ddb87	movq	%rsi, %rbx                    ## rbx = renderer
00000000000ddb8a	movq	%rdi, %r14                    ## r14 = this
00000000000ddb8d	movq	%rsi, %rdi                    ## arg1 = renderer
00000000000ddb90	movq	%r14, %rsi                    ## arg2 = this
00000000000ddb93	xorl	%edx, %edx                    ## arg3 = 0
00000000000ddb95	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000ddb9a	testq	%rax, %rax
00000000000ddb9d	je	0xddbb5                         ## NULL input → return 0
00000000000ddb9f	movq	0x198(%r14), %rdi              ## rdi = this->impl
00000000000ddba6	movq	%rbx, %rsi                    ## rsi = renderer
00000000000ddba9	movq	%rax, %rdx                    ## rdx = input node
00000000000ddbac	popq	%rbx
00000000000ddbad	popq	%r14
00000000000ddbaf	popq	%rbp
00000000000ddbb0	jmp	__ZN24HGDemosaicImplementation13GenerateGraphEP10HGRendererP6HGNode ## HGDemosaicImplementation::GenerateGraph(HGRenderer*, HGNode*)
00000000000ddbb5	xorl	%eax, %eax
00000000000ddbb7	popq	%rbx
00000000000ddbb8	popq	%r14
00000000000ddbba	popq	%rbp
00000000000ddbbb	retq
## Body bytes @0xddb80..0xddbbb (60 bytes), read from thin x86_64 slice:
## 55 48 89 e5 41 56 53 48 89 f3 49 89 fe 48 89 f7 4c 89 f6 31 d2 e8 36 52 01 00
## 48 85 c0 74 16 49 8b be 98 01 00 00 48 89 de 48 89 c2 5b 41 5e 5d e9 XX XX XX XX
## 31 c0 5b 41 5e 5d c3
## Note: otool -tV cannot label this symbol because its linear sweep
## decodes the SetParameter jump-table @0xddb58..0xddb7f as instructions
## (bytes 0e ff ff ff ...) and loses the boundary at 0xddb80. Content
## reconstructed by matching against the ICF-family GetOutput bodies
## (e.g. __ZN13HGInvertAlpha9GetOutputEP10HGRenderer at Helium 0x38a0)
## and by re-reading the raw file bytes at 0xddb80.
